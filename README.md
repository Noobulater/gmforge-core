# gmforge-core
This is a fork of [Noobulater's original work](https://github.com/Noobulater/gmforge-core) for development and pull-request purposes.  If you're here to help me out on things I'm working on specifically, that's great, and thanks!  If you're looking to get GMForge, though, you should really use the original repository.  (If there are pending pull requests from my repo that you would like to see integrated into the core GMForge code, [the GMForge Discord server](https://discord.gg/usy4ByN) would be a perfect place to mention your opinion.)

# Tweaks/Features Under Development
 - Webserver Deployment (How to actually do it, and changes in the code to support easy configuration)
 - Development of pluggable, modularized component architecture that facilitate framework-dependent non-breaking changes to the definition of core-features
 - Addition of server-side support for access into HeroLab portfolio files

# Webserver Deployment
The management for this is configured in the options.json file in the root directory of the repository.  If you want to test your GMForge changes locally, you can remove the "cloudDeployed" key in the options, or just change it to some other text.  Currently, this change assumes that if the "cloudDeployed" key is present in the options, it will have two child keys, "playerLink" and "gmLink" that contain FQDN host names for the GM-facing and Player-facing access points for your webserver.

Note that these host names can, in fact, be IP addresses, have specified port numbers, and include base path names, as long as your webserver configuration is set up to process requests accordingly.

## Webserver Configuration
This deployment has been tested with an Nginx webserver connected to a Phusion Passenger instance that actually handles the rendering of the Node.js GMForge application instance.  [Instructions on setting that up.](https://www.phusionpassenger.com/library/deploy/nginx/deploy/nodejs/)  My testing scenario also employed free security certificates obtained via CertBot/[LetsEncrypt](https://letsencrypt.org/).  Note that this deployment does not (yet) restrict access to images/data content based on any kind of logged-in status, so be aware that anything deployed to the `public/` directory will be publicly available.  (I'm hoping to correct this in a later update.)

Passenger/Nginx as the webserver makes for exceptionally simple configurations.  In my testing, I established one subdomain for GM access and another that provided Player access to the GMForge application running on the server.  To ensure that the server was only spinning up one instance of the GMForge application (currently, the app runs in a mode that can cause memory leaks if more than one instance is active, according to the warning logs), these subdomains had to be handled by a single Nginx server-block.  In addition to that, CertBot automatically installed redirects to ensure that the GMForge app was only accessible via https.  This resulted in two relevant server-blocks, structured roughly as follows:

```nginx
server {

    server_name ~(forge|gm)\.your-domain-name\.net;

    root /path/to/gmforge/public;

    passenger_enabled on;
    passenger_app_type node;
    passenger_startup_file app.js;

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/forge.your-domain-name.net/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/forge.your-domain-name.net/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}

server {

    if ($host = forge.your-domain-name.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = gm.your-domain-name.net) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80 ;
    listen [::]:80 ;
    server_name forge.your-domain-name.net gm.your-domain-name.net;
    return 404; # managed by Certbot

}
```
