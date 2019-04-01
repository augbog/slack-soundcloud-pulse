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

2. If you need help obtaining these values, go into the Network tab when you visit your Soundcloud profile and you should be able to find a request that makes such a call (filter by `api-v2.soundcloud.com`). These calls will have the parameters `client_id` and `app_version` passed. See the image below

<img src="https://raw.githubusercontent.com/augbog/slack-soundcloud-pulse/master/request-example.png" alt="Network tab request images find client_id and app_version" />

3. Set up your Webhook URL in your Slack team. You can do this by going to [Your Apps](https://api.slack.com/apps), creating a new App, and then adding a new Incoming Webhook.
4. Run `npm install` in this repository.
5. Assuming you have done all the steps above, run `npm run start` and you should send a Slack message to the channel you chose when setting up your Webhook URL above.
6. If you wish to have this run on a weekly or monthly basis, you can set up a cron job and have it run the command. My crontab file looks like below and you can access via `sudo crontab -e` and will run Monday 8 AM every week

```
NODE_PATH=/home/pi/.npm/lib/node_modules
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 8 * * 1 /usr/local/bin/npm start --prefix /home/pi/slack-soundcloud-pulse >/dev/null 2>&1
```

## Troubleshooting and other Notes
* The `client_id` value gets refreshed every so often so you may need to verify you have the right `client_id`. I have not pinpointed how often this refresh happens but it seems every few months it can refresh.
* Make sure you specify `NODE_PATH` and `PATH` in your crontab in order for it to run. See [here](https://stackoverflow.com/a/27823675/1168661)
* If you need to verify your cron job is working, you can do a `grep CRON /var/log/syslog` and see if your job is running.
* Sometimes it's nice to be able to test and send Slack attachment results to a test Slack channel. I have created an issue to do this see issue #4.

## Helpful links
* [Soundcloud API guide](https://developers.soundcloud.com/docs/api/reference)
* [Slack Attachment Message Builder](https://api.slack.com/docs/messages/builder)
* [Crontab Generator](https://crontab-generator.org/)
