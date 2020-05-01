import { Program } from '../../dataclasses/program';
import { Position } from '../../dataclasses/position';
import { TestWindowDelegate } from '../../app/desktop/windows/test-window/test-window.component';
import { TerminalWindowDelegate } from '../../app/desktop/windows/terminal/terminal.component';
import { MinerWindowDelegate } from '../../app/desktop/windows/miner/miner.component';
import { SettingsWindowDelegate } from '../../app/desktop/windows/settings/settings.component';
import { TaskManagerWindowDelegate } from '../../app/desktop/windows/task-manager/task-manager.component';
import { WalletAppWindowDelegate } from '../../app/desktop/windows/wallet-app/wallet-app.component';
import { HardwareShopWindowDelegate } from '../../app/desktop/windows/hardware-shop/hardware-shop.component';

export const programWindows = {
  'file-manager': TestWindowDelegate,
  'terminal': TerminalWindowDelegate,
  'miner': MinerWindowDelegate,
  'settings': SettingsWindowDelegate,
  'task-manager': TaskManagerWindowDelegate,
  'wallet-app': WalletAppWindowDelegate,
  'hardware-shop-app': HardwareShopWindowDelegate
};

export const desktopDefinition = {
  username: localStorage.getItem('username'),
  programs: [
    new Program(
      'file-manager',
      programWindows['file-manager'],
      'File-Manager',
      '../../assets/desktop/img/filemanager.svg',
      true,
      new Position(20, 30)
    ),
    new Program(
      'terminal',
      programWindows['terminal'],
      'Terminal',
      '../../assets/desktop/img/terminal.svg',
      true,
      new Position(20, 130)
    ),
    new Program(
      'miner',
      programWindows['miner'],
      'Miner',
      '../../assets/desktop/img/morphcoin_dark.svg',
      true,
      new Position(20, 230)
    ),
    new Program(
      'settings',
      programWindows['settings'],
      'Settings',
      '../../assets/desktop/img/gear.svg',
      true,
      new Position(20, 330)
    ),
    new Program(
      'task-manager',
      programWindows['task-manager'],
      'Task-Manager',
      '../../assets/desktop/img/task-manager.svg',
      true,
      new Position(20, 430)
    ),
    new Program(
      'wallet-app',
      programWindows['wallet-app'],
      'Wallet-App',
      '../../assets/desktop/img/wallet_app.svg',
      true,
      new Position(20, 530)
    ),
    new Program(
      'hardware-shop-app',
      programWindows['hardware-shop-app'],
      'Hardware-Shop-App',
      '../../assets/desktop/img/hardware_shop_app.svg',
      true,
      new Position(20, 630)
    )
  ]
};
