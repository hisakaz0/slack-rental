/* ********************************************************
 * Slack Node+Express Slash Commands Example with BlockKit
 *
 * Tomomi Imura (@girlie_mac)
 * ********************************************************/

const express = require('express');
const bodyParser = require('body-parser');
// const axios = require('axios');
//const qs = require('qs');
const signature = require('./verifySignature');
const slackService = require('./slack-service');

const app = express();

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});



/*
 * Slash Command Endpoint to receive a payload 
 */

app.post('/rental-device', async (req, res) => {
  
  if(!signature.isVerified(req)) {
    res.sendStatus(404); // You may throw 401 or 403, but why not just giving 404 to malicious attackers ;-)
    return;
  }
  
  // console.log(req.body);
  // req.body.user_name
  
  // and send back an HTTP response with data
  const message = {
    response_type: 'ephemeral',
    blocks: slackService.blocks.toSelectAction()
  }; 
  res.json(message);

});  


class ItemStore {
  constructor() {
    this.store = new Map();
  }
  
  getKey(payload) {
    const team = payload.team.id;
    const channel = payload.container.channel_id;
    const ts = payload.container.message_ts; 
    
    return `${team}-${channel}-${ts}`;
  }
  
  load(payload) {
    const key = this.getKey(payload);
    return this.store.has(key) ? this.store.get(key) : this.create();
  }
  
  save(payload, item) {
    const key = this.getKey(payload);
    this.store.set(key, item);
  }
  
  delete(payload) {
    const key = this.getKey(payload);
    this.store.delete(key);
  }
  
  create() {
    return {
      username: undefined,
      action: undefined,
      device_category: undefined,
      device_category_list: undefined,
      rental_device: undefined,
      rental_device_list: undefined,
      return_date: undefined,
    };
  }
}

const itemStore = new ItemStore();
/*
 * Interactive Components Endpoint
 */
app.post('/interact-with-slack', async (req, res) => {
  
  if (!signature.isVerified(req)) {
    res.sendStatus(404);
    return;
  }
  
  const payload = JSON.parse(req.body.payload);
  // console.log(payload.trigger_id);
  // console.log(JSON.stringify(payload));
  // console.log(payload);
  // console.log(payload.message.blocks);
  // console.log(payload.actions);
  
  const selected = {
    action: getActionSelected(payload, 'action'),
    device_category: getActionSelected(payload, 'device_category'),
    return_date: getActionSelected(payload, 'return_date'),
    rental_device: getActionSelected(payload, 'rental_device'),
    submit: getActionSelected(payload, 'submit'),
    cancel: getActionSelected(payload, 'cancel')
  };
  
  
  const item = itemStore.load(payload);
  item.username = payload.user.username;
  
  const device_category_list = ["Android", "iOS", "FireOS"];
  const rental_device_list = ["Xperia 1", "Pixel 3", "Essential", "Huawei P30"];
  
  const message = {
    response_type: 'ephemeral', // only visible to you
  };
  
  // console.log({ selected: selected, item: item, blocks: JSON.stringify(payload.message.blocks)  });
  const isString = (s) => typeof s === typeof '';
      
  if (isString(selected.action)) {
    if (selected.action === "postpon" ) {
      item.action = selected.action;
      item.rental_device_list = rental_device_list;
      item.return_date = getToday();
      message.blocks = slackService.blocks.toSelectReturnDateWhenPostpon(item);
    } else if (selected.action === "return" ) {
      item.action = selected.action;
      item.rental_device_list = rental_device_list;
      message.blocks = slackService.blocks.toSelectRentalDeviceWhenReturn(item);
    } else if (selected.action === "rental") {
      item.action = selected.action;
      item.device_category_list = device_category_list;
      message.blocks = slackService.blocks.toSelectDeviceCategoryWhenRental(item);
    }
    itemStore.save(payload, item);
  } else if (isString(selected.device_category)) {
    item.action = 'rental'; // action is rental ONLY
    item.device_category_list = device_category_list;
    item.device_category = selected.device_category;
    item.rental_device_list = rental_device_list;
    message.blocks = slackService.blocks.toSelectRentalDeviceWhenRental(item);
    itemStore.save(payload, item);
  } else if (isString(selected.rental_device)) {
    if (item.action === 'return') {
      item.rental_device = selected.rental_device;
      message.blocks = slackService.blocks.toSubmitWhenReturn(item);
    } else if (item.action === 'postpon') {
      item.rental_device = selected.rental_device;
      message.blocks = slackService.blocks.toSelectReturnDateWhenPostpon(item);
    } else if (item.action === 'rental') {
      item.rental_device = selected.rental_device;
      message.blocks = slackService.blocks.toSelectReturnDateWhenRental(item);
    }
    itemStore.save(payload, item);
  } else if (isString(selected.return_date)) {
    if (item.action === 'rental') {
      item.return_date = selected.return_date;
      message.blocks = slackService.blocks.toSubmitWhenRental(item);
    } else if (item.action === 'postpon') {
      item.return_date = selected.return_date;
      message.blocks = slackService.blocks.toSubmitWhenPostpon(item);
    }
    itemStore.save(payload, item);
  } else if (selected.submit === 'ok') {
    message.blocks = undefined;
    message.text = 'Accepted';
    message.response_type = 'in_channel';
    console.log({ item: item, submit: true });
    itemStore.delete(payload);
  } else if (selected.cancel === 'cancel') {
    message.blocks = undefined;
    message.text = 'ByeBey.';
    message.response_type = 'in_channel';
    itemStore.delete(payload);
  }
  console.log(item, selected);

  // console.log(JSON.stringify(message));
  slackService.send(payload.response_url, message);
  res.end();
});


const getActionSelected = (payload, act_id) => {
  const act = payload.actions
    .find((act) => act.action_id === act_id);
  return act === undefined            ? undefined :
         act.type === "static_select" ? act.selected_option.value :
         act.type === "datepicker"    ? act.selected_date         :
         act.type === "button"        ? act.value                 : undefined;
};

const getSelectedInMessage = (payload, blk_id) => {
  const blk = payload.message.blocks
    .find(blk => blk.block_id === blk_id);
  if (blk == undefined ||
      blk.accessory === undefined ||
      blk.accessory.initial_option === undefined) return;
  return blk.accessory.initial_option.value;
}

const getValue = (payload, key) => {
  const curr = getActionSelected(payload, key);
  const prev = getSelectedInMessage(payload, key); 
  return curr === undefined ? prev : curr;
}

const getToday = () => {
  const today = new Date();
  const year = `${today.getFullYear()}`;
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const date = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${date}`;
}

app.post('/load-options', (req, res) => {
  
  if (!signature.isVerified(req)) {
    res.sendStatus(404);
    return;
  }
  
  console.log(res.body);
  
  let category_list = ["Android", "iOS", "FireOS"].map(str => {
    return { key: str, value: str };
  });

  const opts = slackService.getOptions(category_list, "plain_text");
  
  res.json(opts);
  
});