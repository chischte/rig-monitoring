# rig-monitoring

**Monitor a test rig**

---

TODO:


- check instructions for adding audio on https://github.com/phoboslab/jsmpeg
- https://jsmpeg.com/
- add login to video stream website

---

Starting point of the project was an instruction for live video streaming found here:  
https://phoboslab.org/log/2013/09/html5-live-video-streaming-via-websockets

The source code to get me started has been copy-pasted from here:  
https://github.com/phoboslab  
The following files have been copied from there:

- view-stream.html ...as starting point for the control_screen.html website
- jsmpeg.min.js ...for the serverpi website
- websocket-relay.js ...renamed to videosocket_relay.js

The System consists of three computers:

- **robopi**  
This is the Pi which is mounted on the Test Rig. Raspbian OS.
- **serverpi**  
This is computer which receives the video Stream from the robopi, it also hosts the webpage.
LinuxMint OS.

- **flugchischte**  
This is the system users computer, to watch the video remote control the robot.

---

## Setup steps:

---

**IP ADDRESSES AND PORTS FOR PORT FORWARDING**

`- DDNS ADDRESS OF THE SERVERPI WEBSITE: http://machinelogger.synology.me:8088/control_screen.html`

`- PORT FOR WEBSITE:-------------------- PUBLIC PORT: 8088 --> PRIVATE PORT: 80`

`- PORT FOR SSH CONNECTION TO SERVERPI:- PUBLIC PORT: 2022 --> PRIVATE PORT: 22`

`- VIDEO FROM ROBOPI TO SERVERPI:------- PUBLIC PORT: 8081 --> PRIVATE PORT: 8081`

`- VIDEO FROM SERVERPI TO BROWSER:------ PUBLIC PORT: 8082 --> PRIVATE PORT: 8082`

`- PORT FOR CONTROL SIGNAL:------------- PUBLIC PORT: 8083 --> PRIVATE PORT: 8083`

---

**SETTING UP A PUBLIC KEY BASED SSH CONNECTIONS**

@flugchischte:

    ssh-keygen -t rsa ...create a RSA type keypair on the flugchischte
    ssh-copy-id pi@55.55.55.55 ...copies the public key to the serverpi
    ssh-copy-id michi@55.55.55.66 ...copies the public key to the robopi

@robopi (to enable connection to serverpi)

    ssh-keygen -t rsa
    ssh-copy-id -p 2022 michi@machinelogger.synology.me

create aliases to connect from flugchiste to robopi or serverpi:

    alias sshrobopi="ssh -p 2023 michi@machinelogger.synology.me"
    alias sshserverpi="ssh -p 2022 michi@machinelogger.synology.me"

The ssh connection to the robopi does only work, if it is connected to the local network.
If the robopi is connected to the internet via the 4G dongle, a connection can be established using VNC viewer (remote desktop client).

---

**Aliases to support git workflow:**

Hardlinks do not update to files that have been overwritten (as it happens in this git workflow).
The following alias updates the hardlinks on the serverpi:

    alias roboupdatehardlinks="
    rm /var/www/websocket/gpio_socket.js;
    ln ~/sshgit/pyrobot/serv erpi/var_www_websocket/gpio_socket.js /var/www/websocket/;
    rm /var/www/websocket/videosock et_relay.js;
    ln ~/sshgit/pyrobot/serverpi/var_www_websocket/videosocket_relay.js /var/www /websocket/"

Alias to pull the repository from serverpi to robopi:

    alias pyrogitpull="
    cd ~/sshgit/pyrobot;
    git fetch --all;
    git reset --hard origin/master"

Alias to push a file from robopi back to serverpi (if edited on robopi)

    alias pyrogitpush="
    cd ~/sshgit/pyrobot;
    git push ssh://michi@machinelogger.synology.me:2022/home/michi/sshgit/pyrobot"

---

**SETTING UP THE ROBO PI**

**Install ffmpg on the robopi:**

Install h264 library to convert video from h264 to mpeg (better handling):  
Instruction found on: http://jollejolles.com/installing-ffmpeg-with-h264-support-on-raspberry-pi/

    cd ~/git
    git clone --depth 1 https://code.videolan.org/videolan/x264.git
    ...alternatively maybe packages @ http://www.deb-multimedia.org/
    cd x264
    ./configure --host=arm-unknown-linux-gnueabi --enable-static --disable-opencl
    make -j4
    sudo make install

Install ffmpg with h264:

    cd ~/git
    git clone git://source.ffmpeg.org/ffmpeg --depth=1
    cd ffmpeg
    ./configure --arch=armel --target-os=linux --enable-gpl --enable-libx264 --enable-nonfree
    make -j4   ...this takes time, 20 minutes maybe
    sudo make install
    ...examplecommand: ffmpeg -i USER_VIDEO.h264 -vcodec copy USER_VIDEO.mp4

**Start gpio_client on the robopi**  
https://pypi.org/project/websocket_client/

    pip install websocket_client
    run application:
    python gpio_client.py

---

**SETTING UP THE SERVER PI**

**Set up an Apache2 webserver**
  
**Install latest node.js and NPM**

**Install videosocket on the serverpi:**

    mkdir /var/www/websocket
    ...create a hardlink, softlink wont work:
    sudo ln ~/git/rig-monitoring/serverpi/var_www_websocket/videosocket_relay.js /var/www/websocket/

    cd /var/www/websocket
    sudo chown -R michi /var/www/websocket
    npm init ...just click through all steps with enter
    npm install --save-dev bufferutil
    npm install --save-dev utf-8-validate
    npm install ws







**Install gpiosocket on the serverpi:**

    ...create a hardlink, softlink wont work:
    sudo ln  ~/git/rig-monitoring/serverpi/var_www_websocket/gpio_socket.js /var/www/websocket/
    ...check if it works:
    cd /var/www/websocket
    node gpio_socket.js
    ...works


**Setup the streaming website on the serverpi**

Create softlinks for apache:

    sudo ln -s ~/git/rig-monitoring/serverpi/var_www_html/control_screen.html /var/www/html/
    sudo ln -s ~/git/rig-monitoring/serverpi/var_www_html/jsmpeg.min.js /var/www/html/
    sudo ln -s ~/git/rig-monitoring/serverpi/var_www_html/control_screen.css /var/www/html/
    sudo ln -s ~/git/rig-monitoring/serverpi/var_www_html/control_screen.js /var/www/html/

    to restart apache:
    sudo /etc/init.d/apache2 restart

---
*************HEEREEE*******************************************************

**Start processes manually**  
These are optional because this processes will be managed by supervisord.

@serverpi:  
cd /var/www/websocket; node videosocket_relay.js supersecret 8081 8082

@robopi:

        ffmpeg \
        -f video4linux2 \
    	    -framerate 30 -video_size 320x240 -i /dev/video0 \
        -f mpegts \
    	    -codec:v mpeg1video -s 320x240 -b:v 1000k -bf 0 \
        http://machinelogger.synology.me:8081/supersecret

Working settings:

framerate: 30 resolution 320x240 (as shown above)
framerate: 30 resolution 640x480
framerate: 20 resolution 800x600

---

**Use supervisord to keep the processes running**

Excellent instructions for how to use supervisord can be found here:  
https://serversforhackers.com/c/monitoring-processes-with-supervisord

@serverpi (videosocket and gpiosocket)

    sudo apt-get install -y supervisor
    sudo service supervisor start
    create softlinks to supervisorconfig:
    sudo ln -s ~/git/rig-monitoring/serverpi/supervisor_videosocket.conf /etc/supervisor/conf.d/
    sudo ln -s ~/git/rig-monitoring/serverpi/supervisor_gpiosocket.conf /etc/supervisor/conf.d/
    sudo mkdir /var/log/pyrolog

    sudo supervisorctl reread ...should not need sudo
    sudo supervisorctl update
    sudo supervisorctl ...shows running processes
    ps aux | grep www ...shows the running process as well

@robopi (videostream and gpio-client)

    sudo apt-get install -y supervisor
    sudo service supervisor start
    create softlink to supervisorconfig:
    sudo ln -s ~/sshgit/pyrobot/robopi/supervisor_videostream.conf /etc/supervisor/conf.d/
    sudo ln -s ~/sshgit/pyrobot/robopi/supervisor_gpioclient.conf /etc/supervisor/conf.d/
    sudo ln -s ~/sshgit/pyrobot/robopi/supervisor_batteryguard.conf /etc/supervisor/conf.d/
    sudo mkdir /var/log/pyrologs
    sudo supervisorctl reread ...should not need sudo
    sudo supervisorctl update
    sudo supervisorctl ...shows running processes
    ps aux | grep michi ...shows the running process as well

---
