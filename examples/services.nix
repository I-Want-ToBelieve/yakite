{...}: let
  # yakite = "/Users/i.want.to.believe/git.workspaces/js.workspaces/yakite/apps/yakite/target/release/yakite";
  yakite = "yakite";
in {
  services = {
    karabiner-elements = {
      enable = true;
    };

    skhd = {
      enable = true;
      skhdConfig = ''
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

        ctrl - t : ${yakite} action toggle-tile-layout
        ctrl - m : ${yakite} action toggle-monocle-layout
        ctrl - f : ${yakite} action toggle-active-window-floating
        ctrl - k : ${yakite} action focus-next-window
        ctrl - i : ${yakite} action focus-previous-window
        ctrl + shift - k : ${yakite} action move-active-window-to-next-position
        ctrl + shift - i : ${yakite} action move-active-window-to-previous-position
        ctrl + shift - m : ${yakite} action push-active-window-into-master-area-front

        ctrl - 0x2A : ${yakite} action switch-to-next-layout

        ctrl - j : ${yakite} action decrease-layout-master-area-size
        ctrl - l : ${yakite} action increase-layout-master-area-size
      '';
    };

    yabai = {
      enable = true;
      enableScriptingAddition = true;
      config = {
        focus_follows_mouse = "off";
        mouse_follows_focus = "off";
        window_opacity = 0.90;
      };
      extraConfig = ''
        borders active_color=0xff6eff89 inactive_color=0xff516468 width=12.0 2>/dev/null 1>&2 &

        yakite-daemon 2>/dev/null 1>&2 &
      '';
    };
  };
}
