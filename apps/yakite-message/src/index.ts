/*
  Hello New Bing!
  Please help me improve this typescript interface I gave you

  When type is 'action', message will only be [
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
     ] one of

  When type is 'event', message will only be one of the signals just defined, such as application-front-switched or application-launched, etc.

  env only exists when type is 'event', and at this time it is an object, and the key is the corresponding one of the signals just defined, such as YABAI_RECENT_SPACE_ID and YABAI_RECENT_DISPLAY_ID, etc.

  type ActionType = 'focusNextWindow' | 'focusPreviousWindow' | 'focusUpperWindow' | 'focusBottomWindow' | 'focusLeftWindow' | 'focusRightWindow' | 'moveActiveWindowToNextPosition' | 'moveActiveWindowToPreviousPosition' | 'moveActiveWindowUp' | 'moveActiveWindowDown' | 'moveActiveWindowLeft' | 'moveActiveWindowRight' | 'increaseActiveWindowWidth' | 'increaseActiveWindowHeight' | 'decreaseActiveWindowWidth' | 'decreaseActiveWindowHeight' | 'increaseMasterAreaWindowCount' | 'decreaseMasterAreaWindowCount' | 'increaseLayoutMasterAreaSize' | 'decreaseLayoutMasterAreaSize' | 'toggleActiveWindowFloating' | 'pushActiveWindowIntoMasterAreaFront' | 'switchToNextLayout' | 'switchToPreviousLayout' | 'toggleTileLayout' | 'toggleMonocleLayout' | 'toggleThreeColumnLayout' | 'toggleStairLayout' | 'toggleSpreadLayout' | 'toggleFloatingLayout' | 'toggleQuarterLayout' | 'toggleSpiralLayout' | 'rotate' | 'rotateReverse' | 'rotatePart';

  type EventType = 'application_launched' | 'application_terminated' | 'application_front_switched' | 'application_visible' | 'application_hidden' | 'window_created' | 'window_destroyed' | 'window_focused' | 'window_moved' | 'window_resized' | 'window_minimized' | 'window_deminimized' | 'window_title_changed' | 'space_created' | 'space_destroyed' | 'space_changed' | 'display_added' | 'display_removed' | 'display_moved' | 'display_resized' | 'display_changed' | 'mission_control_enter' | 'mission_control_exit' | 'dock_did_restart' | 'menu_bar_hidden_changed' | 'dock_did_change_pref';

  type EnvType = {
    YABAI_RECENT_SPACE_ID?: string;
    YABAI_RECENT_DISPLAY_ID?: string;
    // Add more environment variables here...
  };

  export interface Message {
    type: 'action' | 'event';
    message: ActionType | EventType;
    env?: EnvType;
  }

  good jobs, Now please define the sub-export interfaces. They are all specific implementations of the Message export interface.
  export interface ActionMessage extends Message {
    type: 'action';
    message: ActionType;
  }

  export interface EventMessage extends Message {
    type: 'event';
    message: EventType;
    env: EnvType;
  }

  You have already defined the sub-export interface of Message. Please continue to subdivide it and define the sub-export interfaces of the sub-export interface.

  // Sub-export interfaces of ActionMessage
  export interface FocusNextWindowMessage extends ActionMessage {
    message: 'focusNextWindow';
  }

  export interface FocusPreviousWindowMessage extends ActionMessage {
    message: 'focusPreviousWindow';
  }

  // Add more sub-export interfaces here...

  // Sub-export interfaces of EventMessage
  export interface ApplicationLaunchedMessage extends EventMessage {
    message: 'application_launched';
    env: { YABAI_PROCESS_ID: string };
  }

  export interface ApplicationTerminatedMessage extends EventMessage {
    message: 'application_terminated';
    env: { YABAI_PROCESS_ID: string };
  }

  // Add more sub-export interfaces here...

  The last step, please don’t miss any sub-export interface, or any sub-export interface of a sub-export interface.
  Because you need to combine them all into a Type named AllMessage. And don’t forget to display all the types of env. After processing, please send me the code.

  Very good, I will give you all the information. Please complete it based on this information and then send it to me without any comments.
 */

interface ActionMessage {
  type: 'action'
  message: string
  env: undefined
}

interface EventMessage {
  type: 'event'
  message: string
  env: Record<string, string>
}
export interface FocusUpperWindowMessage extends ActionMessage {
  message: 'focusUpperWindow'
}

export interface FocusBottomWindowMessage extends ActionMessage {
  message: 'focusBottomWindow'
}

export interface FocusLeftWindowMessage extends ActionMessage {
  message: 'focusLeftWindow'
}

export interface FocusRightWindowMessage extends ActionMessage {
  message: 'focusRightWindow'
}

export interface MoveActiveWindowToNextPositionMessage extends ActionMessage {
  message: 'moveActiveWindowToNextPosition'
}

export interface MoveActiveWindowToPreviousPositionMessage extends ActionMessage {
  message: 'moveActiveWindowToPreviousPosition'
}

export interface MoveActiveWindowUpMessage extends ActionMessage {
  message: 'moveActiveWindowUp'
}

export interface MoveActiveWindowDownMessage extends ActionMessage {
  message: 'moveActiveWindowDown'
}

export interface MoveActiveWindowLeftMessage extends ActionMessage {
  message: 'moveActiveWindowLeft'
}

export interface MoveActiveWindowRightMessage extends ActionMessage {
  message: 'moveActiveWindowRight'
}

export interface IncreaseActiveWindowWidthMessage extends ActionMessage {
  message: 'increaseActiveWindowWidth'
}

export interface IncreaseActiveWindowHeightMessage extends ActionMessage {
  message: 'increaseActiveWindowHeight'
}

export interface DecreaseActiveWindowWidthMessage extends ActionMessage {
  message: 'decreaseActiveWindowWidth'
}

export interface DecreaseActiveWindowHeightMessage extends ActionMessage {
  message: 'decreaseActiveWindowHeight'
}

export interface IncreaseMasterAreaWindowCountMessage extends ActionMessage {
  message: 'increaseMasterAreaWindowCount'
}

export interface DecreaseMasterAreaWindowCountMessage extends ActionMessage {
  message: 'decreaseMasterAreaWindowCount'
}

export interface IncreaseLayoutMasterAreaSizeMessage extends ActionMessage {
  message: 'increaseLayoutMasterAreaSize'
}

export interface DecreaseLayoutMasterAreaSizeMessage extends ActionMessage {
  message: 'decreaseLayoutMasterAreaSize'
}

export interface ToggleActiveWindowFloatingMessage extends ActionMessage {
  message: 'toggleActiveWindowFloating'
}

export interface PushActiveWindowIntoMasterAreaFrontMessage extends ActionMessage {
  message: 'pushActiveWindowIntoMasterAreaFront'
}

export interface SwitchToNextLayoutMessage extends ActionMessage {
  message: 'switchToNextLayout'
}

export interface SwitchToPreviousLayoutMessage extends ActionMessage {
  message: 'switchToPreviousLayout'
}

export interface ToggleTileLayoutMessage extends ActionMessage {
  message: 'toggleTileLayout'
}

export interface ToggleMonocleLayoutMessage extends ActionMessage {
  message: 'toggleMonocleLayout'
}

export interface ToggleThreeColumnLayoutMessage extends ActionMessage {
  message: 'toggleThreeColumnLayout'
}

export interface ToggleStairLayoutMessage extends ActionMessage {
  message: 'toggleStairLayout'
}

export interface ToggleSpreadLayoutMessage extends ActionMessage {
  message: 'toggleSpreadLayout'
}

export interface ToggleFloatingLayoutMessage extends ActionMessage {
  message: 'toggleFloatingLayout'
}

export interface ToggleQuarterLayoutMessage extends ActionMessage {
  message: 'toggleQuarterLayout'
}

export interface ToggleSpiralLayoutMessage extends ActionMessage {
  message: 'toggleSpiralLayout'
}

export interface RotateMessage extends ActionMessage {
  message: 'rotate'
}

export interface RotateReverseMessage extends ActionMessage {
  message: 'rotateReverse'
}

export interface RotatePartMessage extends ActionMessage {
  message: 'rotatePart'
}

export interface FocusNextWindowMessage extends ActionMessage {
  message: 'focusNextWindow'
}

export interface FocusPreviousWindowMessage extends ActionMessage {
  message: 'focusPreviousWindow'
}

export interface ApplicationLaunchedMessage extends EventMessage {
  message: 'applicationLaunched'
  env: { YABAI_PROCESS_ID: string }
}

export interface ApplicationTerminatedMessage extends EventMessage {
  message: 'applicationTerminated'
  env: { YABAI_PROCESS_ID: string }
}

export interface ApplicationFrontSwitchedMessage extends EventMessage {
  message: 'applicationFrontSwitched'
  env: { YABAI_PROCESS_ID: string, YABAI_RECENT_PROCESS_ID: string }
}

export interface ApplicationVisibleMessage extends EventMessage {
  message: 'applicationVisible'
  env: { YABAI_PROCESS_ID: string }
}

export interface ApplicationHiddenMessage extends EventMessage {
  message: 'applicationHidden'
  env: { YABAI_PROCESS_ID: string }
}

export interface WindowCreatedMessage extends EventMessage {
  message: 'windowCreated'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowDestroyedMessage extends EventMessage {
  message: 'windowDestroyed'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowFocusedMessage extends EventMessage {
  message: 'windowFocused'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowMovedMessage extends EventMessage {
  message: 'windowMoved'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowResizedMessage extends EventMessage {
  message: 'windowResized'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowMinimizedMessage extends EventMessage {
  message: 'windowMinimized'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowDeminimizedMessage extends EventMessage {
  message: 'windowDeminimized'
  env: { YABAI_WINDOW_ID: string }
}

export interface WindowTitleChangedMessage extends EventMessage {
  message: 'windowTitleChanged'
  env: { YABAI_WINDOW_ID: string }
}

export interface SpaceCreatedMessage extends EventMessage {
  message: 'spaceCreated'
  env: { YABAI_SPACE_ID: string }
}

export interface SpaceDestroyedMessage extends EventMessage {
  message: 'spaceDestroyed'
  env: { YABAI_SPACE_ID: string }
}

export interface SpaceChangedMessage extends EventMessage {
  message: 'spaceChanged'
  env: { YABAI_SPACE_ID: string, YABAI_RECENT_SPACE_ID: string }
}

export interface DisplayAddedMessage extends EventMessage {
  message: 'displayAdded'
  env: { YABAI_DISPLAY_ID: string }
}

export interface DisplayRemovedMessage extends EventMessage {
  message: 'displayRemoved'
  env: { YABAI_DISPLAY_ID: string }
}

export interface DisplayMovedMessage extends EventMessage {
  message: 'displayMoved'
  env: { YABAI_DISPLAY_ID: string }
}

export interface DisplayResizedMessage extends EventMessage {
  message: 'displayResized'
  env: { YABAI_DISPLAY_ID: string }
}

export interface DisplayChangedMessage extends EventMessage {
  message: 'displayChanged'
  env: { YABAI_DISPLAY_ID: string, YABAI_RECENT_DISPLAY_ID: string }
}

export interface MissionControlEnterMessage extends EventMessage {
  message: 'missionControlEnter'
}

export interface MissionControlExitMessage extends EventMessage {
  message: 'missionControlExit'
}

export interface DockDidRestartMessage extends EventMessage {
  message: 'dockDidRestart'
}

export interface MenuBarHiddenChangedMessage extends EventMessage {
  message: 'menuBarHiddenChanged'
}

export interface DockDidChangePrefMessage extends EventMessage {
  message: 'dockDidChangePref'
}

export type AllEventMessage = ApplicationLaunchedMessage | ApplicationTerminatedMessage | ApplicationFrontSwitchedMessage | ApplicationVisibleMessage | ApplicationHiddenMessage | WindowCreatedMessage | WindowDestroyedMessage | WindowFocusedMessage | WindowMovedMessage | WindowResizedMessage | WindowMinimizedMessage | WindowDeminimizedMessage | WindowTitleChangedMessage | SpaceCreatedMessage | SpaceDestroyedMessage | SpaceChangedMessage | DisplayAddedMessage | DisplayRemovedMessage | DisplayMovedMessage | DisplayResizedMessage | DisplayChangedMessage | MissionControlEnterMessage | MissionControlExitMessage | DockDidRestartMessage | MenuBarHiddenChangedMessage | DockDidChangePrefMessage

export type AllActionMessage = FocusNextWindowMessage | FocusPreviousWindowMessage | FocusUpperWindowMessage | FocusBottomWindowMessage | FocusLeftWindowMessage | FocusRightWindowMessage | MoveActiveWindowToNextPositionMessage | MoveActiveWindowToPreviousPositionMessage | MoveActiveWindowUpMessage | MoveActiveWindowDownMessage | MoveActiveWindowLeftMessage | MoveActiveWindowRightMessage | IncreaseActiveWindowWidthMessage | IncreaseActiveWindowHeightMessage | DecreaseActiveWindowWidthMessage | DecreaseActiveWindowHeightMessage | IncreaseMasterAreaWindowCountMessage | DecreaseMasterAreaWindowCountMessage | IncreaseLayoutMasterAreaSizeMessage | DecreaseLayoutMasterAreaSizeMessage | ToggleActiveWindowFloatingMessage | PushActiveWindowIntoMasterAreaFrontMessage | SwitchToNextLayoutMessage | SwitchToPreviousLayoutMessage | ToggleTileLayoutMessage | ToggleMonocleLayoutMessage | ToggleThreeColumnLayoutMessage | ToggleStairLayoutMessage | ToggleSpreadLayoutMessage | ToggleFloatingLayoutMessage | ToggleQuarterLayoutMessage | ToggleSpiralLayoutMessage | RotateMessage | RotateReverseMessage | RotatePartMessage

export type EnvTypeMap = {
  [K in AllEventMessage['message']]: Extract<AllEventMessage, { message: K }>['env']
}

export type EventHandlerMap = {
  [K in keyof EnvTypeMap]: (env: EnvTypeMap[K]) => Promise<void>
}

export type Message = AllEventMessage | AllActionMessage

export * from './json-schema-message'
