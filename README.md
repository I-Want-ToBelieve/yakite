[Yakite](https://github.com/I-Want-ToBelieve/yakite)
---

A dynamic tiled window management that bridges the gap between [yabai][] and [krohnkite][]

[![Watch the video](https://github.com/koekeishiya/yabai/assets/24669431/615044d8-cdee-479f-a1ba-bc35af9b0118)](https://github.com/koekeishiya/yabai/assets/24669431/615044d8-cdee-479f-a1ba-bc35af9b0118)



## Prerequisites

Necessary:
- [yabai][]

## Install

brew
```fish
brew tap I-Want-ToBelieve/homebrew-formulae

brew install node yakite yakite-toast

# or brew install yakite-toast-bin

npm --global install yakite-daemon
```

The layout is completed by [krohnkite-core][], which is already embedded in yakite-daemon, so you only need to install yakite-daemon.

Although the name [krohnkite-core][] is used, its source code is obtained from [bismuth][], not [krohnkite][], which is a fork of [krohnkite][]

The yakite-toast is a message window that displays the current layout when the layout is switched.

The yakite-daemon is written in typescript and therefore relies on the node runtime.

The yakite is the messenger for communication between yakite-daemon and [yabai][] and skhd processes.

Or nix
```nix
{pkgs, ...}:
{
 homebrew = {
    enable = true;

    onActivation = {
      autoUpdate = false;
      # 'zap': uninstalls all formulae(and related files) not listed here.
      cleanup = "zap";
    };

    # Applications to install from Mac App Store using mas.
    # You need to install all these Apps manually first so that your apple account have records for them.
    # otherwise Apple Store will refuse to install them.
    # For details, see https://githubfast.com/mas-cli/mas
    masApps = {
      # TODO Feel free to add your favorite apps here.

      # Xcode = 497799835;
    };

    taps = [
      "homebrew/cask"
      "homebrew/cask-fonts"
      "homebrew/services"
      "homebrew/cask-versions"
      "FelixKratz/formulae"
      "I-Want-ToBelieve/homebrew-formulae"
    ];

    # `brew install`
    # TODO Feel free to add your favorite apps here.
    brews = [
      "node"
      "yakite"
      "yakite-toast-bin"
    ];

    # `brew install --cask`
    # TODO Feel free to add your favorite apps here.
    casks = [
    ];
  };
}
```


## Configuration

### yakite.json
The configuration of yakite itself is in `~/.config/yakite/yakite.json`
It will automatically generate this configuration file with default configuration on first run.

It is worth mentioning that the `class` field in `yakite.json` is actually the `app` field in `yabai -m query --windows`


### yabairc

```zsh
yabai -m config focus_follows_mouse off
yabai -m config mouse_follows_focus off
yabai -m config window_opacity 0.900000

borders active_color=0xffe1e3e4 inactive_color=0xff494d64 width=5.0 2>/dev/null 1>&2 &

yakite-daemon 2>/dev/null 1>&2 &
```

### skhdrc
```zsh
ctrl - return : kitty --single-instance -d ~

cmd - backspace : skhd -k "ctrl - space"

ctrl - w : skhd -k "ctrl - up"

ctrl - 1 : yabai -m space --focus 1
ctrl - 2 : yabai -m space --focus 2
ctrl - 3 : yabai -m space --focus 3
ctrl - 4 : yabai -m space --focus 4
ctrl - 5 : yabai -m space --focus 5
ctrl - 6 : yabai -m space --focus 6
ctrl - 7 : yabai -m space --focus 7
ctrl - 8 : yabai -m space --focus 8
ctrl - 9 : yabai -m space --focus 9
ctrl - 0 : yabai -m space --focus 10

ctrl + shift - j : yabai -m window --space prev
ctrl + shift - l : yabai -m window --space next
ctrl + shift - 1 : yabai -m window --space 1
ctrl + shift - 2 : yabai -m window --space 2
ctrl + shift - 3 : yabai -m window --space 3
ctrl + shift - 4 : yabai -m window --space 4
ctrl + shift - 5 : yabai -m window --space 5
ctrl + shift - 6 : yabai -m window --space 6
ctrl + shift - 7 : yabai -m window --space 7
ctrl + shift - 8 : yabai -m window --space 8
ctrl + shift - 9 : yabai -m window --space 9
ctrl + shift - 0 : yabai -m window --space 10


ctrl - q : yabai -m window --close
ctrl - x : yabai -m window --minimize

ctrl - t : yakite action toggle-tile-layout
ctrl - m : yakite action toggle-monocle-layout
ctrl - f : yakite action toggle-active-window-floating
ctrl - k : yakite action focus-next-window
ctrl - i : yakite action focus-previous-window
ctrl + shift - k : yakite action move-active-window-to-next-position
ctrl + shift - i : yakite action move-active-window-to-previous-position
ctrl + shift - m : yakite action push-active-window-into-master-area-front

ctrl - 0x2A : yakite action switch-to-next-layout

ctrl - j : yakite action decrease-layout-master-area-size
ctrl - l : yakite action increase-layout-master-area-size

```

0x2A is `\`


## DEV VERSION

### Prerequisites

Necessary:
- [yabai][]
- [nix-install-macos][]
- [nix-direnv][]

Optional:
- [nix-darwin][]


### Compile and Run

In your terminal:
```fish
mkdir ~/git.workspace
cd ~/git.workspace
git clone https://github.com/I-Want-ToBelieve/yakite.git
cd yakite
direnv allow .
one-click
```

[![asciicast](https://asciinema.org/a/b3QyYyfxtiihnElhJDafu1quK.svg)](https://asciinema.org/a/b3QyYyfxtiihnElhJDafu1quK)

After successfully compiling once, if you want to start yakite again, you only need to run:

```fish
cd ~/git.workspace/yakite
yakite-daemon:run
```

## TODO

- [x] Changesets
  - [x] Implementing non-node package version management through ChangesetsExtra
- [x] Github Actions
  - [x] Version
  - [x] Release
- [ ] Mouse support(Yabai's window does not have the moving and resizing attributes. To judge the behavior of mouse movement or window resizing, additional information must be obtained from the monitoring of mouse events.)
- [ ] Trigger recalculation of available screen space after dock and global menu are hidden
- [ ] Communicates directly with yabai via socket(the current communication is via command line forwarding)
- [ ] Wait for bun to resolve the compatibility issue first and switch the javascript runtime to bun
- [ ] If necessary, wait for GPT to evolve and have it transpile all code to rust, ditching scripts and using native binaries.

[yabai]: https://github.com/koekeishiya/yabai
[krohnkite]: https://github.com/esjeon/krohnkite
[bismuth]: https://github.com/Bismuth-Forge/bismuth
[krohnkite-core]: https://github.com/esjeon/krohnkite
[nix-darwin]: https://github.com/LnL7/nix-darwin/
[nix-direnv]: https://github.com/nix-community/nix-direnv
[nix-install-macos]: https://nixos.org/download#nix-install-macos

