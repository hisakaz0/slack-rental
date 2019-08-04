# Restaurant Search 
Slack Slash Commands + Block Kit Example

---

A sample Slack Node + Express app to receive a slash command and reply with contexual messages.

This example uses Yelp API to display three places near the eare specified by a user.

*e.g.* A user send a command `/find-food pizza, SoMa SF`, the app fetches the result from Yelp and display three pizza joints in SoMa district in San Francisco.


Read the full tutorial: 
[**Building more contextual restaurant search slash command results with Block Kit**](https://api.slack.com/tutorials/slash-block-kit)

![Yelp search on Slack](https://a.slack-edge.com/2619f/img/api/articles/blockkit/slack_message_blockkit.png)

---

## :flags: Remix This Template

First, [Remix this repo](https://glitch.com/edit/#!/remix/slash-blockkit) to work on your own.

## :gear: Setting up Your Slack App

### :zap: Creating a New Slack Slash Command

First, go to [Slack App Config page](https://api.slack.com/apps) to create an app.
Then add features you need.

For Slash command, interactive messages, and event, your Request URL should be your-server + /route, so it should look like:
`https://your-project.glich.me/command`


### :key: Getting Your Credentials

Your *Signing Secret* key is at: 
Settings > **Basic information**

If you distribute your app to public, you'll need the Client ID and Client Secret too.

Also, this example uses [Yelp API](https://www.yelp.com/developers), which requires you to sign up to obtain the Yelp Client ID and API key.


The credential info is stored in the `.env` file. 🗝
```
SLACK_SIGNING_SECRET=enter_code_with_no_space

YELP_CLIENT_ID=
YELP_API_KEY=
```

(Rename the `.env.sample ` in this repo to `.env`, and fill it out with your credentials!)

