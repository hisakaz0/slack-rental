
const https = require('https');

const elements = {};
elements.title = {
  "type": "section",
  "text": {
    "type": "mrkdwn",
    "text": "検証端末の *貸出・返却・延長* を行います！"
  }
};

elements.divider = {
  "type": "divider"
};

elements.getActionSelection = () => {
  const opt_rental = {"text": {
            "type": "plain_text",
            "emoji": true,
            "text": "貸し出し"
          },
          "value": "rental"
        };
  const opt_return = {
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": "返却"
          },
          "value": "return"
        };
  const opt_postpon = {
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": "延長"
          },
          "value": "postpon"
        };
  
  // const initial_option = 
  //       init === "rental"  ? opt_rental :
  //       init === "return"  ? opt_return :
  //       init === "postpon" ? opt_postpon : undefined;
  
  return {
    "type": "section",
    "block_id": "action",
    "text": {
      "type": "mrkdwn",
      "text": ":lower_left_paintbrush:  手続き"
    },
    "accessory": {
      "type": "static_select",
      "placeholder": {
        "type": "plain_text",
        "emoji": true,
        "text": "貸し出し"
      },
      "action_id": "action",
      // "initial_option": initial_option,
      "options": [
        opt_rental, opt_return, opt_postpon
      ]
    }
  }
};

elements.getCategorySelection = (category_list) => {
  
  const block = {
		"type": "section",
    "block_id": "device_category",
		"text": {
			"type": "mrkdwn",
			"text": ":spiral_note_pad:  デバイス区分"
		},
		"accessory": {
			"type": "static_select",
      "action_id": "device_category",
			"placeholder": {
				"type": "plain_text",
				"text": "Android, iOS, FireOS, Chromecast",
				"emoji": true
			},
			"options": []
    }
  };

  block.accessory.options = category_list
    .map(category => { 
      return {
        "text": {
          "type": "plain_text",
          "text": category,
          "emoji": true
        },
        "value": category
      }
    });
  
  // block.accessory.initial_option = block.accessory.options
  //   .find(opt => opt.value === init);
  
  return block;
};

elements.getDeviceSelection = (device_list) => {
  const block = {
		"type": "section",
    "block_id": "rental_device",
		"text": {
			"type": "mrkdwn",
			"text": ":iphone:  デバイス"
		},
		"accessory": {
			"type": "static_select",
			"action_id": "rental_device",
			"placeholder": {
				"type": "plain_text",
				"text": "Xperia 1",
				"emoji": true
			},
			"options": []
    }
  };
  
  block.accessory.options = device_list
    .map(device => {
      return {
					"text": {
						"type": "plain_text",
						"text": device,
						"emoji": true
					},
					"value": device
      }
    });
		  
//   block.accessory.initial_option = block.accessory.options
//     .find(opt => opt.value === init);
  
  return block;
};

elements.getDatePickerToReturn = (init) => {

  return {
		"type": "section",
    "block_id": "return_date",
		"text": {
			"type": "mrkdwn",
			"text": ":date:  返却予定日"
		},
		"accessory": {
			"type": "datepicker",
			"initial_date": init,
			"action_id": "return_date",
			"placeholder": {
				"type": "plain_text",
				"text": "Select a date",
				"emoji": true
			}
		}
	}
};

elements.getConfirmMessage = () => {
  return {
		"type": "section",
    "block_id": "submit",
		"text": {
			"type": "plain_text",
			"text": ":woman-tipping-hand:  以上の内容でよろしいでしょうか:question: ",
			"emoji": true
		}
	};
}

elements.getSubmitButtons = () => {
  return {
		"type": "actions",
		"elements": [
			{
				"type": "button",
        "action_id": "submit",
				"text": {
					"type": "plain_text",
					"text": "いいよー :+1: ",
					"emoji": true
				},
				"value": "ok"
			},
      {
				"type": "button",
        "action_id": "cancel",
				"text": {
					"type": "plain_text",
					"text": "やっぱなしでー :smiling_imp:",
					"emoji": true
				},
				"value": "cancel"
			}  
		]
	};
};

const blocks = {};

blocks.toSelectAction = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
  ];
}
	
blocks.toSelectDeviceCategoryWhenRental = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getCategorySelection(item.device_category_list)
  ];
};

blocks.toSelectRentalDeviceWhenRental = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getCategorySelection(item.device_category_list),
    elements.getDeviceSelection(item.rental_device_list),
  ]
};

blocks.toSelectReturnDateWhenRental = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getCategorySelection(item.device_category_list),
    elements.getDeviceSelection(item.rental_device_list),
    elements.getDatePickerToReturn(getToday())
  ]
};
blocks.toSubmitWhenRental = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getCategorySelection(item.device_category_list,),
    elements.getDeviceSelection(item.rental_device_list),
    elements.getDatePickerToReturn(getToday()),
    elements.divider,
    elements.getConfirmMessage(),
    elements.getSubmitButtons()
  ]
}

blocks.toSelectRentalDeviceWhenReturn = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getDeviceSelection(item.rental_device_list),
  ];
};

blocks.toSubmitWhenReturn = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getDeviceSelection(item.rental_device_list),
    elements.divider,
    elements.getConfirmMessage(),
    elements.getSubmitButtons()
  ]
}

blocks.toSelectRentalDeviceWhenPostpon = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getDeviceSelection(item.rental_device_list),
  ];
}
blocks.toSelectReturnDateWhenPostpon = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getDeviceSelection(item.rental_device_list),
    elements.getDatePickerToReturn(getToday()),
  ];
}
blocks.toSubmitWhenPostpon = (item) => {
  return [
    elements.title,
    elements.divider,
    elements.getActionSelection(),
    elements.getDeviceSelection(item.rental_device_list),
    elements.getDatePickerToReturn(getToday()),
    elements.divider,
    elements.getConfirmMessage(),
    elements.getSubmitButtons()
  ];
}

blocks.getOptions = (list, type) => {
  return {
    options: list.map(item => {
      return {
        text: {
          type: type,
          text: item.key
        },
        value: item.value
      };
    })
  };
};

const send = (url, json) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(url, options, (res) => {
    res.on('end', () => {
      console.log("send responsed.");
    });
  });
  
  req.write(JSON.stringify(json));
  req.end();

};

const getToday = () => {
  const today = new Date();
  const year = `${today.getFullYear()}`;
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const date = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${date}`;
}


module.exports = { blocks, send } ;
