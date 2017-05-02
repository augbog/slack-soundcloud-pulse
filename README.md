# Soundcloud Pulse
A Slack App that will crawl a specific Soundcloud User and post stats of how their tracks are doing into a channel.

<img src="https://raw.githubusercontent.com/augbog/slack-soundcloud-pulse/master/soundcloud-pulse-example.png" alt="Slack Soundcloud Pulse example post" />

## Set up

1. Create `config.json` in `config/` and supply these values. You can also duplicate and create a `config.test.json` if you wish to test into a different webhook.

```
{
  "SOUNDCLOUD_USER_ID": "",
  "CLIENT_ID": "",
  "APP_VERSION": "",
  "SLACK_WEBHOOK_URL": ""
}
```

2. If you need help obtaining these values, go into the Network tab when you visit your Soundcloud profile and you should be able to find a request that makes such a call (filter by `api-v2.soundcloud.com`). These calls will have the paramenters `client_id` and `app_version` passed.
3. Set up your Webhook URL in your Slack team. You can do this by going to [Your Apps](https://api.slack.com/apps), creating a new App, and then adding a new Incoming Webhook.
4. Run `npm install` in this repository.
5. Assuming you have done all the steps above, run `npm run start` and you should send a Slack message to the channel you chose when setting up your Webhook URL above.
6. If you wish to have this run on a weekly or monthly basis, you can set up a cron job and have it run the command. My crontab file looks like below and you can access via `crontab -e`

```
NODE_PATH=/home/pi/.npm/lib/node_modules
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 8 * * 1 /usr/local/bin/npm run --prefix /home/pi/slack-soundcloud-pulse >/dev/null 2>&1
```


## Helpful links
* [Soundcloud API guide](https://developers.soundcloud.com/docs/api/reference)
* [Slack Attachment Message Builder](https://api.slack.com/docs/messages/builder)
