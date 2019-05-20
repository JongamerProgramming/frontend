import { TerminalAPI, TerminalState } from './terminal-api';
import { WebsocketService } from '../../../websocket.service';
import { map } from 'rxjs/operators';


export class DefaultTerminalState implements TerminalState {

  commands = {
    'help': this.help.bind(this),
    'status': this.status.bind(this),
    'hostname': this.hostname.bind(this),
    'ls': this.ls.bind(this),
    'l': this.ls.bind(this),
    'dir': this.ls.bind(this),
    'touch': this.touch.bind(this),
    'cat': this.cat.bind(this),
    'rm': this.rm.bind(this),
    'cp': this.cp.bind(this),
    'mv': this.mv.bind(this),
    'exit': this.exit.bind(this),
    'quit': this.exit.bind(this),
    'clear': this.clear.bind(this),
    'history': this.history.bind(this),
    'morphcoin': this.morphcoin.bind(this),
    'pay': this.pay.bind(this),
    'service': this.service.bind(this),

    // easter egg
    'chaozz': () => {
      this.terminal.outputText('"mess with the best, die like the rest :D`" - chaozz');
    }
  };

  protocol: string[] = [];


  constructor(protected websocket: WebsocketService, protected terminal: TerminalAPI,
              protected activeDevice: object, protected username: string) {
  }

  executeCommand(command: string, args: string[]) {
    command = command.toLowerCase();
    if (this.commands.hasOwnProperty(command)) {
      this.commands[command](args, this.terminal);
    } else if (command !== '') {
      this.terminal.output(
        'Command could not be found.<br/>Type `help` for a list of commands.'
      );
    }
  }

  execute(command: string) {
    const command_ = command.trim().split(' ');
    if (command_.length === 0) {
      return;
    }
    this.executeCommand(command_[0], command_.slice(1));
    if (command) {
      this.protocol.unshift(command);
    }
  }

  autocomplete(content: string): string {
    return content
      ? Object.keys(this.commands)
        .filter(n => !['chaozz'].includes(n))
        .sort()
        .find(n => n.startsWith(content))
      : '';
  }

  refreshPrompt() {
    this.terminal.changePrompt(this.username + '@' + this.activeDevice['name'] + ' $');
  }

  getHistory(): string[] {
    return this.protocol;
  }


  help(args: string[]) {
    const commands: string = Object.keys(this.commands)
      .filter(n => !['chaozz', 'help'].includes(n))
      .join('<br />');
    this.terminal.output(commands);
  }

  status(args: string[]) {
    this.websocket.request({
      action: 'info'
    }).subscribe(r => {
      this.terminal.outputText('online = ' + (r.online - 1));
    });
  }

  hostname(args: string[]) {
    if (args.length === 1) {
      const hostname = args[0];
      this.websocket.ms('device', ['device', 'change_name'], {
        device_uuid: this.activeDevice['uuid'],
        name: hostname
      }).subscribe(r => {
        this.activeDevice = r;
        this.refreshPrompt();
      });
    } else {
      this.terminal.outputText(this.activeDevice['name']);
    }
  }

  ls(args: string[]) {
    this.websocket.ms('device', ['file', 'all'], {
      device_uuid: this.activeDevice['uuid']
    }).subscribe(r => {
      if (r.files != null) {
        r.files.forEach(e => {
          this.terminal.outputText(e.filename);
        });
      }
    });
  }

  touch(args: string[]) {
    if (args.length >= 1) {
      const filename = args[0];
      let content = '';

      if (args.length > 1) {
        content = args.slice(1).join(' ');
      }

      this.websocket.ms('device', ['file', 'create'], {
        device_uuid: this.activeDevice['uuid'],
        filename: filename,
        content: content
      });
    } else {
      this.terminal.outputText('usage: touch <filename> [content]');
    }
  }

  cat(args: string[]) {
    if (args.length === 1) {
      const name = args[0];

      this.websocket.ms('device', ['file', 'all'], {
        device_uuid: this.activeDevice['uuid']
      }).subscribe(r => {
        r.files.forEach(e => {
          if (e != null && e.filename === name) {
            if (e.content !== '') {
              this.terminal.outputText(e.content);
            }
          }
        });
      });
    } else {
      this.terminal.outputText('usage: cat <filename>');
    }
  }

  rm(args: string[]) {
    if (args.length === 1) {
      const name = args[0];

      this.websocket.ms('device', ['file', 'all'], {
        device_uuid: this.activeDevice['uuid']
      }).subscribe(r => {
        r.files.forEach(e => {
          if (e != null && e.filename === name) {
            this.websocket.ms('device', ['file', 'delete'], {
              device_uuid: this.activeDevice['uuid'],
              file_uuid: e.uuid
            });
          }
        });
      });
    } else {
      this.terminal.outputText('usage: rm <filename>');
    }
  }

  cp(args: string[]) {
    if (args.length === 2) {
      const src = args[0];
      const dest = args[1];

      this.websocket.ms('device', ['file', 'all'], {
        device_uuid: this.activeDevice['uuid']
      }).subscribe(r => {
        r.files.forEach(e => {
          if (e != null && e.filename === src) {
            this.websocket.ms('device', ['file', 'create'], {
              device_uuid: this.activeDevice['uuid'],
              filename: dest,
              content: e.content
            });
          }
        });
      });
    } else {
      this.terminal.outputText('usage: cp <source> <destination>');
    }
  }

  mv(args: string[]) {
    if (args.length === 2) {
      const src = args[0];
      const dest = args[1];

      this.websocket.ms('device', ['file', 'all'], {
        device_uuid: this.activeDevice['uuid']
      }).subscribe(r => {
        r.files.forEach(e => {
          if (e != null && e.filename === src) {
            this.websocket.ms('device', ['file', 'create'], {
              device_uuid: this.activeDevice['uuid'],
              filename: dest,
              content: e.content
            }).subscribe(r2 => {
              this.websocket.ms('device', ['file', 'delete'], {
                device_uuid: this.activeDevice['uuid'],
                file_uuid: e.uuid
              });
            });
          }
        });
      });
    } else {
      this.terminal.outputText('usage: mv <source> <destination>');
    }
  }

  exit() {
    this.terminal.popState();
  }

  clear() {
    this.terminal.clear();
  }

  history() {
    const l = this.getHistory();

    l.reverse();

    l.forEach(e => {
      this.terminal.outputText(e);
    });
  }

  morphcoin(args: string[]) {
    if (args.length === 2) {
      const filename = args[1];
      if (args[0] === 'look') {
        this.websocket.ms('device', ['file', 'all'], {
          device_uuid: this.activeDevice['uuid']
        }).subscribe(r => {
          for (const e of r.files) {
            if (e != null && e.filename === filename) {
              if (e.content !== '') {
                const uuid = e.content.split(' ')[0];
                const key = e.content
                  .split(' ')
                  .splice(1)
                  .join(' ');
                this.websocket.ms('currency', ['get'], {
                  source_uuid: uuid,
                  key: key
                }).subscribe(r2 => {
                  if (r2.error == null) {
                    this.terminal.outputText(r2.success.amount + ' morphcoin');
                  } else {
                    this.terminal.outputText('File is no walletfile');
                  }
                });
                return;
              } else {
                this.terminal.outputText('File is no valid walletfile');
                return;
              }
            }
          }
          this.terminal.outputText('That file doesn\'t exist');
        });
      } else if (args[0] === 'create') {
        this.websocket.ms('currency', ['create'], {}).subscribe(r => {
          if (r['error'] != null) {
            this.terminal.outputText('You already own a wallet');
            return;
          }

          this.websocket.ms('device', ['file', 'create'], {
            device_uuid: this.activeDevice['uuid'],
            filename: filename,
            content: r.uuid + ' ' + r.key
          });
        });
      }
    } else {
      this.terminal.outputText('usage: morphcoin look|create <filename>');
    }
  }

  pay(args: string[]) {
    if (args.length === 3 || args.length === 4) {
      const filename = args[0];
      const receiver = args[1];
      const amount = args[2];
      let usage = '';

      if (args.length === 4) {
        usage = args[3];
      }

      if (isNaN(parseInt(amount, 10))) {
        this.terminal.output('<em>amount</em> is not a number');
      } else {
        this.websocket
          .ms('device', ['file', 'all'], {
            device_uuid: this.activeDevice['uuid']
          })
          .subscribe(r => {
            r.files.forEach(e => {
              if (e != null && e.filename === filename) {
                if (e.content !== '') {
                  const uuid = e.content.split(' ')[0];
                  const key = e.content
                    .split(' ')
                    .splice(1)
                    .join(' ');
                  this.websocket
                    .ms('currency', ['get'], {
                      source_uuid: uuid,
                      key: key
                    })
                    .subscribe(r2 => {
                      if (r2.error == null) {
                        this.websocket
                          .ms('currency', ['send'], {
                            source_uuid: uuid,
                            key: key,
                            send_amount: parseInt(amount, 10),
                            destination_uuid: receiver,
                            usage: usage
                          })
                          .subscribe(r3 => {
                              if (r3.error == null) {
                                this.terminal.outputText('send ' + amount + ' to ' + receiver);
                              } else {
                                this.terminal.outputText(r3.error);
                              }
                            }
                          );
                      } else {
                        this.terminal.output('no valid walletfile');
                      }
                    });
                }
              }
            });
          });
      }
    } else {
      this.terminal.outputText('usage: pay <filename> <receiver> <amount> [usage]');
    }
  }

  service(args: string[]) {
    const activeDevice = this.activeDevice['uuid'];

    const getService = name => {
      return this.websocket.ms('service', ['list'], { device_uuid: activeDevice }).pipe(map(data => {
        const deviceServices = data['services'];
        if (deviceServices == null || !(deviceServices instanceof Array)) {
          return null;
        }
        return (deviceServices as any[]).find(service => service['name'] === name);
      }));
    };

    if (args.length >= 1 && args[0].toLowerCase() === 'create') {
      if (args.length !== 2) {
        this.terminal.outputText('usage: service create <brute4ce|portscan|telnet|ssh>');
        return;
      }

      const service = args[1];
      const services = ['brute4ce', 'portscan', 'telnet', 'ssh'];
      if (!services.includes(service)) {
        this.terminal.outputText('Unknown service. Available services: ' + services.join(', '));
        return;
      }
      this.websocket.ms('service', ['create'], { name: service, device_uuid: activeDevice }).subscribe(data => {
        if (data['error'] == null) {
          this.terminal.outputText('Service was created');
        } else {
          this.terminal.outputText('You already created this service');  // TODO: more detailed errors
        }
      });
    } else if (args.length >= 1 && args[0] === 'bruteforce') {
      if (args.length !== 3) {
        this.terminal.outputText('usage: service bruteforce <target-device> <target-service>');
        return;
      }

      const [targetDevice, targetService] = args.slice(1);
      getService('bruteforce').subscribe(bruteforceService => {
        if (bruteforceService == null) {
          this.terminal.outputText('You have to create a bruteforce service before you use it');
          return;
        }

        this.websocket.ms('service', ['use'], {
          service_uuid: bruteforceService, device_uuid: activeDevice,
          target_device: targetDevice, target_service: targetService
        }).subscribe(useData => {
          if (useData['ok'] === true) {
            if (useData['access'] == null) {
              this.terminal.outputText('You started a bruteforce attack');
            } else if (useData['access'] === true) {
              this.terminal.outputText('Access granted');
            } else {
              this.terminal.outputText('Access denied. The bruteforce attack was not successful');
            }
          } else {
            this.terminal.outputText('Your attack couldn\'t be started');
          }
        });
      });
    } else if (args.length >= 1 && args[0] === 'portscan') {
      if (args.length !== 2) {
        this.terminal.outputText('usage: service portscan <device>');
        return;
      }

      const targetDevice = args[1];
      getService('portscan').subscribe(portscanService => {
        if (portscanService == null) {
          this.terminal.outputText('You have to create a portscan service before you use it');
          return;
        }

        this.websocket.ms('service', ['use'], {
          service_uuid: portscanService, device_uuid: activeDevice,
          target_device: targetDevice
        }).subscribe(data => {
          const runningServices = data['services'];
          if (runningServices == null || !(runningServices instanceof Array) || (runningServices as any[]).length === 0) {
            this.terminal.outputText('That device doesn\'t have any running services');
            return;
          }

          this.terminal.outputText('Running services on that device:')
          (runningServices as any[])
            .map(service => service['name'] + ' (UUID: ' + service['uuid'] + ' Port: ' + service['running_port'] + ')')
            .forEach(service => this.terminal.outputText(service));
        });
      });
    } else {
      this.terminal.outputText('usage: service create|bruteforce|portscan');
    }
  }

}