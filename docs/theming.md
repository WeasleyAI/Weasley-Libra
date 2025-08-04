Skip to content
Navigation Menu
danny-avila
LibreChat

Type / to search
Code
Issues
162
Pull requests
78
Discussions
Actions
Projects
1
Security
Insights
[Question]: Change logo, color and images #3706
 Answered by berry-13
rivindubandara asked this question in Q&A
[Question]: Change logo, color and images
#3706
@rivindubandara
rivindubandara
on Aug 19, 2024 · 10 comments · 16 replies
 Answered by berry-13 Return to top

rivindubandara
on Aug 19, 2024
What is your question?
I want to change the main logo, the color of the ui and also the chatgpt logo
image
image
image
image

More Details
What I have done to change the colors temporarily is override the root colors however, sometimes when i refresh it doesnt stick.

What is the main subject of your question?
No response

Screenshots
No response

Code of Conduct
 I agree to follow this project's Code of Conduct
Answered by berry-13
on Aug 20, 2024
@rivindubandara If you want to set a global "preset" for everyone, use a modelSpec., where you can image and custom instructions

View full answer 
Replies:10 comments · 16 replies

berry-13
on Aug 20, 2024
Collaborator
you can change logo of the endpoint by creating a custom endpoint. You can modify the logo by changing the logo.svg in client/public/assets. What you did with the css it's pretty good, it's more likely to be a cache issue, try disabling cache in the inspect network tab and also test the changes on a fresh browser

0 replies

berry-13
on Aug 20, 2024
Collaborator
@rivindubandara If you want to set a global "preset" for everyone, use a modelSpec., where you can image and custom instructions

0 replies
Answer selected by rivindubandara

Varial17
on Sep 19, 2024
Hey, whenever I change the logo in client/public/assets, it never updates when deployed via docker. Does anyone know why?

1 reply
@joseph-holland
joseph-holland
on Sep 23, 2024
Are you rebuilding the image or just using the deploy-compose.yml? If deploy with docker compose you should look into the docker-override docs here https://www.librechat.ai/docs/configuration/docker_override

This will allow you to pass your own custom logos, etc. into the built image without having to rebuild it yourself.

version: '3.4'
 
services:
  api:
    volumes:
      - ./client/public/assets/logo.svg:/app/client/public/assets/logo.svg
      - etc....

Varial17
on Sep 23, 2024
I have this and no version, I will try yours

services:
api:
volumes:
- ./client/public/assets:/app/client/public/assets
- type: bind
source: ./librechat.yaml
target: /app/librechat.yaml

11 replies
@joseph-holland
joseph-holland
on Jan 8
Here is my docker-compose.override.yml file contents:

version: '3.4'

services:
  api:
    volumes:
      - ./client/public/assets/favicon-16x16.png:/app/client/public/assets/favicon-16x16.png
      - ./client/public/assets/favicon-32x32.png:/app/client/public/assets/favicon-32x32.png
      - ./client/public/assets/favicon-16x16.png:/app/client/dist/assets/favicon-16x16.png
      - ./client/public/assets/favicon-32x32.png:/app/client/dist/assets/favicon-32x32.png
      - ./client/public/assets/logo.svg:/app/client/dist/assets/logo.svg
      - ./client/public/assets/custom_icon.png:/app/client/dist/assets/custom_icon.png
      - ./client/public/assets/apple-touch-icon-180x180.png:/app/client/public/assets/apple-touch-icon-180x180.png
      - ./client/public/assets/apple-touch-icon-180x180.png:/app/client/dist/assets/apple-touch-icon-180x180.png
      - ./client/public/assets/maskable-icon.png:/app/client/public/assets/maskable-icon.png
      - ./client/public/assets/maskable-icon.png:/app/client/dist/assets/maskable-icon.png
      - ./client/manifest.webmanifest:/app/client/dist/manifest.webmanifest
      - ./client/new_index.html:/app/client/dist/index.html
I can't remember which one worked to change the icon for the saved webapp thing, but I think it was something to do with the ./client/manifest.webmanifest or something
{"name":"CustomName Chat","short_name":"CustomName Chat","start_url":"/","display":"standalone","background_color":"#000000","lang":"en","scope":"/","theme_color":"#009688","icons":[{"src":"/assets/favicon-32x32.png","sizes":"32x32","type":"image/png"},{"src":"/assets/favicon-16x16.png","sizes":"16x16","type":"image/png"},{"src":"/assets/apple-touch-icon-180x180.png","sizes":"180x180","type":"image/png"},{"src":"/assets/maskable-icon.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}

I hope this helps @InvaderJ, sorry for not getting back sooner.

@InvaderJ
InvaderJ
on Jan 8
@joseph-holland No sorries allowed! This is hugely helpful, thank you so much. I managed to solve my PWA icon issue.

Of course the next hurdle, which is technically answered by your own manifest content, is the name of the PWA. I've changed it in vite.config.ts, no dice. I then made an override to try and force my own vote.config.ts in, no dice. And, I changed the title in index.html and have an override there as well.

My manifest.webmanifest always comes back with the original "LibreChat" name for the PWA.

Wondering if there was anything else you did to get the PWA title changed? I see you are forcing your own manifest.webmanifest. I'm still assuming Vite would generate properly against its own config file but that seems not to be the case. Hmm.

Thanks again!

@joseph-holland
joseph-holland
on Jan 8
I think I also had to create a custom index.html too and override the default. AFAIK when I was looking at this the ts file wouldn't be processed properly because we're not building it, don't quote me on that 😁.

The answer is definitely in the list above. Also I started from the first line down, so the index.html was the last file I modified, so I'm 99% sure that was it. I think it was as simple at the title attribute.

@joseph-holland
joseph-holland
on Jan 8
Make sure the modified manifest file is being put in the correct destination folder too. I think something like that tripped me up also.

@joseph-holland
joseph-holland
on Jan 8
Make sure to clear cache too or something. I think when I was originally hitting this, even if I removed the PWA icon from the homescreen when i added it back it kept the old name. I think I had to go into the site in the browser and remove any files from that site to fix this. It's been about six months since I hit these issues, so I can't fully remember.


mlin01
on Jan 16
I have the same issue to change the background color on the login page and I am new to react app.
Can someone give detail instructions? Thanks in advance!

0 replies

kamaldua65
on May 24
i am totally lost. i tried various settings in docker override but unable to make it work. I am using remote server as per https://www.librechat.ai/docs/remote/docker_linux

here is what file structure i have on my server.
image

image

this is what i am adding to docker override, ( i have even tried different settings as per above posts).
api:
volumes:
- ./librechat.yaml:/app/librechat.yaml
- ./assets/favicon-16x16.png:/app/assets/favicon-16x16.png
- ./assets/favicon-32x32.png:/app/assets/favicon-32x32.png
- ./assets/logo.svg:/app/assets/logo.svg
also if i add mapping to custom file name i get 404 error when try to access it directly.

Any suggestions

0 replies

omarnadhim
on May 25
I changed the logo icon but it didn''t reflect at all !
@danny-avila

0 replies

estone81
on May 25
Sponsor
You need to use /app/client/dist/assets not /app/assets. Like so.

./logo.svg:/app/client/dist/assets/logo.svg
3 replies
@omarnadhim
omarnadhim
on May 25
I edit it like this

./logo.svg:/root/LibreChat/client/dist/assets/logo.svg
but mothing also happened still the icon not changed in the tab and also in the home page of the login
@estone81
@joseph-holland
joseph-holland
on May 25
One tricky thing I found here too is that your browser can cache the old logo also. I found some strange behaviour like that when originally testing this. Try in a new private window, etc.

@estone81
estone81
on May 25
Sponsor
and your new logo.svg needs to be your base /LibreChat folder. You also did /root instead of /app. and then this should be part of the docker compose override file.


kamaldua65
on May 25
nothing works, and i believe this is due to remote server installation, as app is already built by danny and logo gets overwritten from compiled version every time.

here is from remote server installation page:
Quote
Note: this is using a special compose file optimized for this deployed environment. If you would like more configuration here, you should inspect the deploy-compose.yml and Dockerfile.multi files to see how they are setup. We are not building the image in this environment since it’s not enough RAM to properly do so. Instead, we pull the latest dev-api image of librechat, which is automatically built after each push to main.
unQuote

1 reply
@estone81
estone81
on May 25
Sponsor
I'm not sure. This is my docker compose override file and it works for me. I also start via sudo docker compose -f deploy-compose.yml -f docker-compose.override.yml

services:
api:
volumes:
- type: bind
source: ./librechat.yaml
target: /app/librechat.yaml
- ./apple-touch-icon-180x180.png:/app/client/dist/assets/apple-touch-icon-180x180.png
- ./apple-touch-icon-180x180.png:/app/client/dist/assets/favicon-16x16.png
- ./apple-touch-icon-180x180.png:/app/client/dist/assets/favicon-32x32.png
- ./logo.svg:/app/client/dist/assets/logo.svg
- ./button-arrow.svg:/app/client/dist/assets/button-arrow.svg
- ./index.html:/app/client/dist/index.html


liHai001
3 weeks ago
Hi, did you solve this problem. I also can't change logo, when i change the file "docker-compose.override.yml" like this:
and finally run command: docker compose up

services:
  api:
    volumes:
       - type: bind
         source: ./librechat.yaml
         target: /app/librechat.yaml
       - ./librechat.yaml:/app/librechat.yaml
       - ./client/public/assets/favicon-16x16.png:/app/client/public/assets/favicon-16x16.png
       - ./client/public/assets/favicon-32x32.png:/app/client/public/assets/favicon-32x32.png
       - ./client/public/assets/apple-touch-icon-180x180.png:/app/client/public/assets/apple-touch-icon-180x180.png
0 replies


🙏
Q&A
Labels
❓ question
10 participants
@rivindubandara
@InvaderJ
@kamaldua65
@mlin01
@joseph-holland
@berry-13
@omarnadhim
@Varial17
@liHai001
@estone81
Converted from issue
This discussion was converted from issue #3702 on August 20, 2024 02:09.
