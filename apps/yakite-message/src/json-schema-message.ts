/*
   hello new bing please perfect this
   json schema  {
        YABAI_DISPLAY_ID: {
          nullable: true,
          type: 'string'
        },
        YABAI_WINDOW_ID: { nullable: true, type: 'string' }
      }

   Please use nullable: true, to represent null
 */
export const jsonSchemaMessage = {
  title: 'Message Schema',
  type: 'object',
  properties: {
    type: {
      type: 'string'
    },
    message: {
      type: 'string'
    },
    env: {
      nullable: true,
      type: 'object',
      properties: {
        YABAI_DISPLAY_ID: {
          type: 'string',
          nullable: true
        },
        YABAI_WINDOW_ID: {
          type: 'string',
          nullable: true
        },
        YABAI_PROCESS_ID: {
          type: 'string',
          nullable: true
        },
        YABAI_RECENT_PROCESS_ID: {
          type: 'string',
          nullable: true
        },
        YABAI_SPACE_ID: {
          type: 'string',
          nullable: true
        },
        YABAI_RECENT_SPACE_ID: {
          type: 'string',
          nullable: true
        }
      }
    },
    code: {
      type: 'integer'
    }
  }
}
