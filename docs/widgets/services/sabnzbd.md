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
```

The widget refreshes at the configured interval without reloading the page. If `refreshInterval` is omitted, the default Homepage revalidation behavior is used.
