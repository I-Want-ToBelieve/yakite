/**
  Hello New bing.
  I want to use Node's commander NPM package to write a command line program called yakite in the form of Typescript and ES6  modules. yakite is A dynamic tiled window management that bridges the gap between yabai and krohnkite. The version number is 0.0.1, which will I have a subcommand action, please send me the code, thank you!
*/

/**
  New bing, you are so awesome!
  Let's continue talking about the sub-command action. It will send the received parameters through zeromq in a
  publish-subscribe mode on host 127.0.0.1 and port 20206. Please send me the code. Thank you!
*/
/*
  New Bing, You did a great job g, please send me all the code you send me in JavaScript Standard Style, okay?
*/

/*
  New Bing We now need to make a judgment on the parameters of the action.
  We can only send the valid parameters through zeromq.
  The valid parameters are the keys of the following objects.
  You first preprocess this object and convert all its keys to An array,
  and then determine whether the parameter is one of them. If so, send it through zeromq, otherwise an error log will be output.
  Oh, let me tell you first, I pass winston.createLogger under @/common/logger.ts A logger is defined and exported,
  you should import it and use it.
  Now I give you that object, you can send me the code, thank you:
  ```typescript
  {
    focusNextWindow,
    focusPreviousWindow,
    focusUpperWindow,
    focusBottomWindow,
    focusLeftWindow,
    focusRightWindow,
    moveActiveWindowToNextPosition,
    moveActiveWindowToPreviousPosition,
    moveActiveWindowUp,
    moveActiveWindowDown,
    moveActiveWindowLeft,
    moveActiveWindowRight,
    increaseActiveWindowWidth,
    increaseActiveWindowHeight,
    decreaseActiveWindowWidth,
    decreaseActiveWindowHeight,
    increaseMasterAreaWindowCount,
    decreaseMasterAreaWindowCount,
    increaseLayoutMasterAreaSize,
    decreaseLayoutMasterAreaSize,
    toggleActiveWindowFloating,
    pushActiveWindowIntoMasterAreaFront,
    switchToNextLayout,
    switchToPreviousLayout,
    toggleTileLayout,
    toggleMonocleLayout,
    toggleThreeColumnLayout,
    toggleStairLayout,
    toggleSpreadLayout,
    toggleFloatingLayout,
    toggleQuarterLayout,
    toggleSpiralLayout,
    rotate,
    rotateReverse,
    rotatePart
  }
  ```
*/


/*
 Hello new bing, the zeromq node version cold start is too slow,
 I'm going to change the following command line program to rust implementation,
 please rewrite this command line program with rust-zmq and clap, and send it to me, thank you
 ```ts
   import { Command } from 'commander'
   import zmq from 'zeromq'
   // import logger from '../common/logger'

   const program = new Command()
   const publisher = new zmq.Publisher()

   const validParams = [
     'focusNextWindow',
     'focusPreviousWindow',
     'focusUpperWindow',
     'focusBottomWindow',
     'focusLeftWindow',
     'focusRightWindow',
     'moveActiveWindowToNextPosition',
     'moveActiveWindowToPreviousPosition',
     'moveActiveWindowUp',
     'moveActiveWindowDown',
     'moveActiveWindowLeft',
     'moveActiveWindowRight',
     'increaseActiveWindowWidth',
     'increaseActiveWindowHeight',
     'decreaseActiveWindowWidth',
     'decreaseActiveWindowHeight',
     'increaseMasterAreaWindowCount',
     'decreaseMasterAreaWindowCount',
     'increaseLayoutMasterAreaSize',
     'decreaseLayoutMasterAreaSize',
     'toggleActiveWindowFloating',
     'pushActiveWindowIntoMasterAreaFront',
     'switchToNextLayout',
     'switchToPreviousLayout',
     'toggleTileLayout',
     'toggleMonocleLayout',
     'toggleThreeColumnLayout',
     'toggleStairLayout',
     'toggleSpreadLayout',
     'toggleFloatingLayout',
     'toggleQuarterLayout',
     'toggleSpiralLayout',
     'rotate',
     'rotateReverse',
     'rotatePart'
   ]

   program
     .version('0.0.1')
     .description('A dynamic tiled window management that bridges the gap between yabai and krohnkite')

   program
     .command('action <params...>')
     .description('Send the received parameters through ZeroMQ in a publish-subscribe mode on host 127.0.0.1 and port 20206')
     .action(async (params) => {
       await publisher.bind('tcp://127.0.0.1:3001')
       await new Promise(resolve => { setTimeout(resolve, 150) })
       for (const param of params) {
         if (validParams.includes(param)) {
           await publisher.send(['action', param])
           console.log(`Sent parameter: ${param}`)
         } else {
           // logger.error(`Invalid yakite action parameter: ${param}`)
         }
       }
     })

   program.parse(process.argv)
 ```
*/
use clap::{Args, Parser, Subcommand};
use log::{error, info};
use serde_json::json;
use std::collections::HashMap;
use std::error::Error;
use std::time::SystemTime;

fn setup_logger() -> Result<(), fern::InitError> {
  fern::Dispatch::new()
    .format(|out, message, record| {
      out.finish(format_args!(
        "[{} {} {}] {}",
        humantime::format_rfc3339_seconds(SystemTime::now()),
        record.level(),
        record.target(),
        message
      ))
    })
    .level(log::LevelFilter::Debug)
    .chain(std::io::stdout())
    .chain(fern::log_file("/tmp/yakite.log")?)
    .apply()?;
  Ok(())
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
  // Optional name to operate on
  action: Option<String>,
  // Optional event to operate on
  event: Option<String>,

  #[clap(subcommand)]
  command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
  #[clap(
    about = "Please use this subcommand to define the shortcut key mapping for manipulating the window layout."
  )]
  Action(Action),

  #[clap(
    about = "Please do not use this, yakite-daemon will automatically set up the event for you"
  )]
  Event(Event),
}

#[derive(Args)]
struct Action {
  string: Option<String>,
  #[arg(short, long)]
  list: bool,
}

#[derive(Args)]
struct Event {
  strings: String,
  #[arg(short, long)]
  env: Option<Vec<String>>,
}

fn get_valid_actions() -> std::collections::HashMap<&'static str, &'static str> {
  HashMap::from([
    ("move-active-window-left", "moveActiveWindowLeft"),
    (
      "decrease-active-window-height",
      "decreaseActiveWindowHeight",
    ),
    ("move-active-window-up", "moveActiveWindowUp"),
    ("toggle-monocle-layout", "toggleMonocleLayout"),
    ("toggle-floating-layout", "toggleFloatingLayout"),
    (
      "increase-active-window-height",
      "increaseActiveWindowHeight",
    ),
    ("toggle-quarter-layout", "toggleQuarterLayout"),
    (
      "push-active-window-into-master-area-front",
      "pushActiveWindowIntoMasterAreaFront",
    ),
    ("toggle-tile-layout", "toggleTileLayout"),
    ("focus-bottom-window", "focusBottomWindow"),
    (
      "increase-master-area-window-count",
      "increaseMasterAreaWindowCount",
    ),
    (
      "move-active-window-to-previous-position",
      "moveActiveWindowToPreviousPosition",
    ),
    (
      "decrease-master-area-window-count",
      "decreaseMasterAreaWindowCount",
    ),
    ("rotate-reverse", "rotateReverse"),
    (
      "move-active-window-to-next-position",
      "moveActiveWindowToNextPosition",
    ),
    ("rotate-part", "rotatePart"),
    ("toggle-three-column-layout", "toggleThreeColumnLayout"),
    ("focus-previous-window", "focusPreviousWindow"),
    ("decrease-active-window-width", "decreaseActiveWindowWidth"),
    ("toggle-stair-layout", "toggleStairLayout"),
    ("move-active-window-right", "moveActiveWindowRight"),
    (
      "increase-layout-master-area-size",
      "increaseLayoutMasterAreaSize",
    ),
    ("focus-right-window", "focusRightWindow"),
    ("increase-active-window-width", "increaseActiveWindowWidth"),
    ("toggle-spread-layout", "toggleSpreadLayout"),
    ("focus-next-window", "focusNextWindow"),
    (
      "toggle-active-window-floating",
      "toggleActiveWindowFloating",
    ),
    ("focus-upper-window", "focusUpperWindow"),
    ("focus-left-window", "focusLeftWindow"),
    ("toggle-spiral-layout", "toggleSpiralLayout"),
    ("rotate", "rotate"),
    (
      "decrease-layout-master-area-size",
      "decreaseLayoutMasterAreaSize",
    ),
    ("switch-to-next-layout", "switchToNextLayout"),
    ("switch-to-previous-layout", "switchToPreviousLayout"),
    ("move-active-window-down", "moveActiveWindowDown"),
  ])
}

fn get_valid_events() -> std::collections::HashMap<&'static str, &'static str> {
  HashMap::from([
    // ("application-launched", "applicationLaunched"),
    // ("application-terminated", "applicationTerminated"),
    // ("application-front-switched", "applicationFrontSwitched"),
    ("application-visible", "applicationVisible"),
    ("application-hidden", "applicationHidden"),
    ("window-created", "windowCreated"),
    ("window-destroyed", "windowDestroyed"),
    ("window-focused", "windowFocused"),
    ("window-moved", "windowMoved"),
    // ("window-resized", "windowResized"),
    ("window-minimized", "windowMinimized"),
    ("window-deminimized", "windowDeminimized"),
    // ("window-title-changed", "windowTitleChanged"),
    ("space-created", "spaceCreated"),
    ("space-destroyed", "spaceDestroyed"),
    ("space-changed", "spaceChanged"),
    ("display-added", "displayAdded"),
    ("display-removed", "displayRemoved"),
    ("display-moved", "displayMoved"),
    ("display-resized", "displayResized"),
    ("display-changed", "displayChanged"),
    // ("mission-control-enter", "missionControlEnter"),
    // ("mission-control-exit", "missionControlExit"),
    // ("dock-did-restart", "dockDidRestart"),
    // ("menu-bar-hidden-changed", "menuBarHiddenChanged"),
    // ("dock-did-change-pref", "dockDidChangePref"),
  ])
}

fn main() -> Result<(), Box<dyn Error>> {
  setup_logger()?;
  let cli = Cli::parse();

  match &cli.command {
    Some(Commands::Action(action)) => {
      let valid_actions = get_valid_actions();

      if action.list {
        for key in valid_actions.keys() {
          println!("{}", key);
        }
      }

      if let Some(action_str) = &action.string {
        if valid_actions.contains_key(&action_str.as_str()) {
          let context = zmq::Context::new();
          let requester = context.socket(zmq::REQ).unwrap();

          requester
            .connect("tcp://127.0.0.1:20206")
            .expect("should binding publisher");

          requester.set_rcvtimeo(1000).unwrap();

          requester
            .send(
              serde_json::to_string(&json!({
                "type": "action",
                "message": valid_actions.get(&action_str.as_str()),
              }))
              .unwrap()
              .as_str(),
              0,
            )
            .expect("should send action");

          info!("Send action: {}", action_str);

          match requester.recv_msg(0) {
            Ok(msg) => {
              info!("Received action: {:?}", msg.as_str());
            }
            Err(zmq::Error::EAGAIN) => {
              error!("Timeout: no message received. {}", &action_str);
              println!("Timeout: no message received. {}", &action_str);
              std::process::exit(1)
            }
            Err(e) => {
              error!("Error: {}", e);
              std::process::exit(1)
            }
          }
        } else if !action.list {
          println!("Invalid action parameter: {}", action_str);
          error!("Invalid action parameter: {}", action_str);
        }
      }
    }
    Some(Commands::Event(event)) => {
      let valid_events = get_valid_events();

      if valid_events.contains_key(&event.strings.as_str()) {
        let context = zmq::Context::new();
        let requester = context.socket(zmq::REQ).unwrap();

        requester
          .connect("tcp://127.0.0.1:20206")
          .expect("should binding publisher");

        requester.set_rcvtimeo(1000).unwrap();
        /*
         Hello New Bing.
         I want to convert a vec like
         ```rust
         Some(["YABAI_WINDOW_ID=290", "YABAI_PROCESS_ID=233", "YABAI_RECENT_PROCESS_ID=567"])
         ```
         into an anonymous struct  in rust
         ```rust
         struct {
                 YABAI_WINDOW_ID: 290,
                 YABAI_PROCESS_ID: 233,
                 YABAI_RECENT_PROCESS_ID: 567,
             }
         ```
         please send me the code, thank you

         the input is Some

         Can you use something like the map method in javascript instead of for in traversal,
         so that you can chain calls to reduce the number of lines of code?
        */
        requester
          .send(
            serde_json::to_string(&json!({
              "type": "event",
              "message": valid_events.get(&event.strings.as_str()) ,
              "env": event.env.clone().unwrap_or_default()
                      .iter()
                      .map(|it| {
                          let parts: Vec<&str> = it.split('=').collect();
                          (parts[0], parts[1].parse::<i32>().unwrap())
                      })
                      .collect::<HashMap<&str, i32>>(),
            }))
            .unwrap()
            .as_str(),
            0,
          )
          .expect("should send event");

        info!("send event: {} + {:?}", event.strings, event.env);
        match requester.recv_msg(0) {
          Ok(msg) => {
            info!("Received: {:?}", msg.as_str());
          }
          Err(zmq::Error::EAGAIN) => {
            error!("Timeout: no message received.");
            println!("Timeout: no message received.");
            std::process::exit(1)
          }
          Err(e) => {
            error!("Error: {}", e);
            std::process::exit(1)
          }
        }
      }
    }
    None => {}
  }

  Ok(())
}
