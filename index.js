/* ********************************************************
 * Slack Node+Express Slash Commands Example with BlockKit
 *
 * Tomomi Imura (@girlie_mac)
 * ********************************************************/

const express = require('express');
const bodyParser = require('body-parser');
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
  
  const selected = [
    'action', 'device_category','return_date', 'rental_device', 'submit', 'cancel'
  ].map(id => {
    return { key: id, val: getActionSelected(payload, id) }
  }).find(
    i => typeof i.val !== typeof undefined
  );
  
  const item = itemStore.load(payload);
  item.username = payload.user.username;
  
  const device_category_list = ["Android", "iOS", "FireOS"];
  const rental_device_list = ["Xperia 1", "Pixel 3", "Essential", "Huawei P30"];
  
  let message = {};
    
  // set item 
  if (selected.key === 'action') {
    item.action = selected.val;
    item.rental_device_list = rental_device_list;
    item.device_category_list = device_category_list;
    item.return_date = slackService.getTodayStr();
  } else if (selected.key === 'device_category') {
    item.device_category = selected.val;
  } else if (selected.key === 'rental_device') {
    item.rental_device = selected.val;
  } else if (selected.key === 'return_date') {
    item.return_date = selected.val;
  }
  
  // set blocks or text, response_type
  if (selected.key === 'submit') {
    message = { 
      response_type: 'in_channel',
      text: 'Accepted'
    };
  } else if (selected.key === 'cancel') {
    message = {
      response_type: 'ephemeral',
      text: 'ByeBey.'
    };
  } else if (item.action === "rental" ) {
    message = {
      response_type: 'ephemeral',
      blocks: slackService.blocks.toSubmitWhenRental(item)
    };
  } else if (item.action === "return" ) {
    message = {
      response_type: 'ephemeral',
      blocks: slackService.blocks.toSubmitWhenReturn(item)
    };
  } else if (item.action === "postpon") {
    message = {
      response_type: 'ephemeral',
      blocks: slackService.blocks.toSubmitWhenPostpon(item)
    };
  } 
  
  // console.log({ selected: selected, item: item });
  
  // save or delete item
  if (selected.key === 'submit') {
    itemStore.delete(payload);
  } else if (selected.key === 'cancel') {
    message.response_type = 'ephemeral'; // only visible to you
    itemStore.delete(payload);
  } else {
    message.response_type = 'ephemeral'; // only visible to you
    itemStore.save(payload, item);
  }
  
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


/* 
 * Load options from external source.
 */ 
app.post('/load-options', (req, res) => {
  
  console.log(res.body);
  
  if (!signature.isVerified(req)) {
    res.sendStatus(404);
    return;
  }
  
  let category_list = ["Android", "iOS", "FireOS"].map(str => {
    return { key: str, value: str };
  });

  const opts = slackService.getOptions(category_list, "plain_text");
  
  res.json(opts);
  
});