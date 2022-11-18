### Auto start node app
```
sudo cp exitpuzzles.chess.service /etc/systemd/system/

# install service
sudo systemctl enable exitpuzzles.chess.service

# start service
sudo systemctl start exitpuzzles.chess.service

# to check status
sudo systemctl status exitpuzzles.chess.service

```

Afterwards, should be able to 'shutdown -r now' and see it come online with ssh and node service

### Start/Stop to run by hand
```
sudo systemctl stop exitpuzzles.chess.service
```

### udev
#### to get udev rule info 
```sudo udevadm info /dev/ttyUSB1```

#### to restart without reboot
```sudo udevadm control --reload-rules && sudo udevadm trigger```


