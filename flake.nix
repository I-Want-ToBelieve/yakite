{
  description = "A dynamic tiled window management that bridges the gap between yabai and krohnkite";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    devenv.url = "github:cachix/devenv";
    nix2container.url = "github:nlewo/nix2container";
    nix2container.inputs.nixpkgs.follows = "nixpkgs";
    mk-shell-bin.url = "github:rrbutani/nix-mk-shell-bin";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    treefmt-nix.url = "github:numtide/treefmt-nix";
    flake-root.url = "github:srid/flake-root";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = [
      "https://mirrors.tuna.tsinghua.edu.cn/nix-channels/store"
      "https://mirrors.ustc.edu.cn/nix-channels/store"
      "https://devenv.cachix.org"
    ];
  };

  outputs = inputs @ {
    flake-parts,
    nixpkgs,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;} {
      imports = [inputs.devenv.flakeModule inputs.treefmt-nix.flakeModule inputs.flake-root.flakeModule];
      systems = [
        "x86_64-linux"
        "i686-linux"
        "x86_64-darwin"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      perSystem = {
        config,
        self',
        inputs',
        pkgs,
        system,
        ...
      }: let
        cargoBuildInputs =
          pkgs.lib.optionals pkgs.stdenv.isDarwin
          (with pkgs.darwin.apple_sdk; [
            frameworks.Security
            frameworks.CoreServices
          ]);
      in {
        # Per-system attributes can be defined here. The self' and inputs'
        # module parameters provide easy access to attributes of the same
        # system.
        devenv.shells.default = {
          name = "yakite mono repo";

          imports = [
            # This is just like the imports in devenv.nix.
            # See https://devenv.sh/guides/using-with-flake-parts/#import-a-devenv-module
            # ./devenv-foo.nix
          ];

          # https://devenv.sh/reference/options/
          packages = with pkgs;
            [bun]
            ++ [zellij]
            ++ [pkg-config libsodium cmake] # zeromq
            ++ [nodePackages.pnpm npm-check-updates];

          # https://devenv.sh/basics/
          env = {
            GREET = "🛠️ Let's hack 🧑🏻‍💻";
          };

          # https://devenv.sh/scripts/
          scripts.hello.exec = "echo $GREET";
          scripts.up.exec = "ncu -i";

          scripts."krohnkite-core:build".exec = ''
            cd $DEVENV_ROOT/apps/krohnkite-core
            pnpm build
          '';
          scripts."yakite-yabai:build".exec = ''
            cd $DEVENV_ROOT/apps/yakite-yabai
            pnpm build
          '';
          scripts."yakite-yabai:test".exec = ''
            cd $DEVENV_ROOT/apps/yakite-yabai
            pnpm test
          '';
          scripts."yakite-bridge:build".exec = ''
            cd $DEVENV_ROOT/apps/yakite-bridge
            pnpm build
          '';
          scripts."yakite-daemon:build".exec = ''
            cd $DEVENV_ROOT/apps/yakite-daemon
            pnpm build
          '';
          scripts."yakite-daemon:run".exec = ''
            cd $DEVENV_ROOT/apps/yakite-daemon
            ./dist/bin/yakite-daemon.js
          '';
          scripts."yakite:build".exec = ''
            cd $DEVENV_ROOT/apps/yakite
            cargo build --release
          '';
          scripts."yakite-toast:build".exec = ''
            cd $DEVENV_ROOT/apps/yakite-toast/src
            mkdir ../dist
            /usr/bin/clang -framework Cocoa yakite-toast.m -o ../dist/yakite-toast \
            && bunx chalk-cli green bold 'Build Done!' \
            || bunx chalk-cli red bold 'Build Failed!'

          '';
          scripts."yakite-toast:test".exec = ''
            cd $DEVENV_ROOT/apps/yakite-toast/dist
            ./yakite-toast --time 3.14 --text "Tile Layout"
          '';
          scripts."all:build".exec = ''
            cd $DEVENV_ROOT
            sh -c $'sleep 0.314;zellij -s yakite -s yakite action write-chars "zellij run -- yakite-toast:build\n"' &
            sh -c $'sleep 0.314;zellij -s yakite -s yakite action write-chars "zellij run -- yakite:build\n"' &
            sh -c $'sleep 0.314;zellij -s yakite -s yakite action write-chars "zellij run -- pnpm --recursiv build\n"' &
            zellij --session yakite || zellij attach yakite
          '';
          scripts."one-click".exec = ''
            pnpm i && all:build
            yakite-daemon:run
          '';

          scripts."git-user:setup".exec = ''
            git config user.name I-Want-ToBelieve
            git config user.email i.want.tobelieve.dev@gmail.com
          '';

          enterShell = ''
            hello
          '';

          # https://devenv.sh/languages/
          # yakite-daemon yakite-bridge krohnkite-core yabai
          languages.javascript = {
            enable = true;
            package = pkgs.nodejs_20; # latest lts version
          };
          languages.typescript = {enable = true;};

          # yakite
          languages.rust = {
            enable = true;
            channel = "stable";
            components = ["rustc" "cargo" "clippy" "rustfmt" "rust-analyzer"];
          };

          # Make diffs fantastic
          difftastic.enable = true;

          # https://devenv.sh/pre-commit-hooks/
          pre-commit.hooks = {
            # commons
            editorconfig-checker.enable = true;

            # configs
            yamllint.enable = true;

            # nix
            alejandra.enable = true;

            # javascript
            prettier.enable = false;
            eslint.enable = true;

            # rust
            rustfmt.enable = true;
            clippy.enable = true;

            # objective-c
            clang-format.enable = false;
          };

          # Plugin configuration
          pre-commit.settings = {yamllint.relaxed = true;};
        };

        treefmt.config = {
          inherit (config.flake-root) projectRootFile;
          # This is the default, and can be overriden.
          package = pkgs.treefmt;

          # formats .nix files
          programs.alejandra.enable = true;
        };
      };
      flake = {
        # The usual flake attributes can be defined here, including system-
        # agnostic ones like nixosModule and system-enumerating ones, although
        # those are more easily expressed in perSystem.
      };
    };
}
