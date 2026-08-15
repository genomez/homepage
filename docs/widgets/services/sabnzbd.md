---
title: SABnzbd
description: SABnzbd Widget Configuration
---

Learn more about [SABnzbd](https://github.com/sabnzbd/sabnzbd).

Find your API key under `Config > General`.

Allowed fields: `["rate", "queue", "timeleft"]`.

```yaml
widget:
  type: sabnzbd
  url: http://sabnzbd.host.or.ip
  key: apikeyapikeyapikeyapikeyapikey
  refreshInterval: 5000 # optional - in milliseconds, minimum 1000
  enableQueue: true # optional - show the download queue, defaults to false
  limit: 10 # optional - maximum queue entries to display, defaults to 5
```

The widget refreshes at the configured interval without reloading the page. If `refreshInterval` is omitted, the default Homepage revalidation behavior is used. Set `enableQueue` to show queue entries below the summary, with `limit` controlling how many are displayed.
