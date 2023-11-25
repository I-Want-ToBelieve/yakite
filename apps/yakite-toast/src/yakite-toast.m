#import <Cocoa/Cocoa.h>
#import <Foundation/Foundation.h>
#import <signal.h>

@interface ToastWindow : NSPanel
@end

@implementation ToastWindow

- (BOOL)canBecomeKeyWindow {
  return YES;
}

- (BOOL)canBecomeMainWindow {
  return YES;
}

- (void)mouseDown:(NSEvent *)theEvent {
  // Do nothing
}

@end

void handleSIGTERM(int signum) {
    // Re-raise the signal to terminate the program.
    signal(signum, SIG_DFL);
    raise(signum);
}

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *path = @"/tmp/yakite-toast.pid";
        NSFileManager *fileManager = [NSFileManager defaultManager];

        signal(SIGTERM, handleSIGTERM);

        if ([fileManager fileExistsAtPath:path]) {
            NSString *pidString = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
            pid_t pid = [pidString intValue];
            kill(pid, SIGTERM);
        }

        pid_t myPid = getpid();
        NSString *myPidString = [NSString stringWithFormat:@"%d", myPid];
        [myPidString writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:nil];

        NSApplication *app = [NSApplication sharedApplication];

        // Parse command line arguments
        NSArray *arguments = [[NSProcessInfo processInfo] arguments];
        BOOL version = [arguments containsObject:@"--version"];
        BOOL help = [arguments containsObject:@"--help"];

        if (version) {
          printf("Version: 0.1.7\n");
          return 0;
        }

        if (help) {
          printf("Usage: %s [--version] [--help] [--text] [--time] [--position]\n",
                 argv[0]);
          printf("Options:\n");
          printf("  --version    Print the version number\n");
          printf("  --help       Show this help message\n");
          printf("  --text       Set the text (default: \"Default text\")\n");
          printf("  --time       Set the display time (default: 1.0)\n");
          printf("  --position   Set the position (default: \"center\")\n");
          return 0;
        }

        // Parse command line arguments
        NSDictionary *args =
            [[NSUserDefaults standardUserDefaults] dictionaryRepresentation];

        NSString *text = args[@"-text"] ?: @"Default text";
        NSTimeInterval time = [args[@"-time"] doubleValue] ?: 1.5;
        NSString *position = args[@"-position"] ?: @"center";

        // Create window

        ToastWindow *window = [[ToastWindow alloc]
            initWithContentRect:NSMakeRect(0, 0, 380, 100)
                      styleMask:NSWindowStyleMaskNonactivatingPanel |
                                NSWindowStyleMaskFullSizeContentView
                        backing:NSBackingStoreBuffered
                          defer:NO];

        [window setOpaque:NO];
        [window setHasShadow:NO];
        [window setMovableByWindowBackground:YES];
        [window setStyleMask:NSWindowStyleMaskFullSizeContentView];
        [window.contentView setWantsLayer:YES];
        window.contentView.layer.backgroundColor =
            [[NSColor colorWithWhite:1 alpha:0.5] CGColor];
        window.contentView.layer.cornerRadius = 10;
        window.contentView.layer.masksToBounds = YES;

        [window setLevel:NSFloatingWindowLevel];
        [window setBackgroundColor:[NSColor colorWithWhite:1 alpha:0]];
        [window setIgnoresMouseEvents:YES];

        // Set window position
        NSRect screenRect = [[NSScreen mainScreen] frame];
        NSRect windowRect = [window frame];
        if ([position isEqualToString:@"top"]) {
          windowRect.origin.y = screenRect.size.height - windowRect.size.height;
        } else if ([position isEqualToString:@"bottom"]) {
          windowRect.origin.y = 0;
        } else if ([position isEqualToString:@"left"]) {
          windowRect.origin.x = 0;
        } else if ([position isEqualToString:@"right"]) {
          windowRect.origin.x = screenRect.size.width - windowRect.size.width;
        } else if ([position isEqualToString:@"center"]) {
          windowRect.origin.x = (screenRect.size.width - windowRect.size.width) / 2;
          windowRect.origin.y =
              (screenRect.size.height - windowRect.size.height) / 2;
        }
        [window setFrame:windowRect display:YES];

        // Create visual effect view
        NSVisualEffectView *visualEffectView = [[NSVisualEffectView alloc]
            initWithFrame:[[window contentView] bounds]];
        [visualEffectView
            setAutoresizingMask:NSViewWidthSizable | NSViewHeightSizable];
        [visualEffectView setBlendingMode:NSVisualEffectBlendingModeBehindWindow];
        [visualEffectView setMaterial:NSVisualEffectMaterialUnderWindowBackground];
        [visualEffectView setState:NSVisualEffectStateActive];

        // Create text field
        NSTextView *textView =
            [[NSTextView alloc] initWithFrame:NSMakeRect(0, 0, 380, 35)];
        [textView setString:text];
        [textView setFont:[NSFont boldSystemFontOfSize:35]];

        [textView setEditable:NO];
        [textView setSelectable:NO];
        [textView setBackgroundColor:[NSColor clearColor]];
        [textView setDrawsBackground:NO];
        [textView setVerticallyResizable:YES];
        [textView setAlignment:NSTextAlignmentCenter];
        [textView
            setTextContainerInset:NSMakeSize(0, ([window frame].size.height -
                                                 [textView frame].size.height) /
                                                    2)];

        // Add subviews
        [visualEffectView addSubview:textView];
        [[window contentView] addSubview:visualEffectView];

        // Show window
        [window makeKeyAndOrderFront:app];

        // Hide window after delay
        dispatch_after(
            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(time * NSEC_PER_SEC)),
            dispatch_get_main_queue(), ^{
              [window orderOut:app];
              [NSApp terminate:app];
            });

        // Run app
        [app run];
    }
    return 0;
}
