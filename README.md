Currently there are only development versions.

The release of npm, crates.io, brew, nix and github still requires some time to configure github actions and changesets.

[![Watch the video](https://github.com/koekeishiya/yabai/assets/24669431/615044d8-cdee-479f-a1ba-bc35af9b0118)](https://github.com/koekeishiya/yabai/assets/24669431/615044d8-cdee-479f-a1ba-bc35af9b0118)
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



### Configuration
Please refer to the examples folder to learn how to interact with skhd and the yabai configuration items I am using.

The configuration of yakite itself is in `~/.config/yakite/yakite.json`
It will automatically generate this configuration file with default configuration on first run.



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
[nix-darwin]: https://github.com/LnL7/nix-darwin/
[nix-direnv]: https://github.com/nix-community/nix-direnv
[nix-install-macos]: https://nixos.org/download#nix-install-macos

