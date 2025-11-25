// Centralized asset path constants
export const ASSET_PATHS = {
  videos: {
    background: '/wonderland.mp4',
    backgroundMobile: '/mobileback.mp4',
    intro: '/veed2.mp4',
    loop: '/SANTA_CC_CUT_0011_FIRE_PLACE-ezgif.com-reverse-video (1).mp4',
    northPole: '/north pole.mp4'
  },
  images: {
    backgroundPlaceholder: '/processed-image (81).png',
    candy: '/candy.png',
    closeButton: '/close_button.svg',
    elf: '/elf.png',
    elfDead: '/elf-dead.png',
    elfDown: '/elfdown.png',
    elfUp: '/elfup.png',
    footerLogo: '/Frame 2147229103.png',
    gameBackground: '/game-background-long.png',
    lastSanta: '/lastsanta.png',
    learnMore: '/learnmore2.png',
    phoneIcon: '/Frame 50.svg',
    postcardStamp: '/postcard-stamp.png',
    powered: '/powered.png',
    poweredBy: '/poweredby.png',
    santa: '/santa2.png',
    midTree: '/mid-tree.png',
    shortTree: '/short-tree.png',
    tallTree: '/tall-tree.png',
    snowflake: '/snowflake.png'
  },
  icons: {
    mic: '/icons/mic.svg',
    video: '/icons/video.svg',
    volumeOn: '/icons/volume-on.svg',
    volumeOff: '/icons/volume-off.svg',
    moodHappy: '/icons/mood-happy.svg',
    moodHappyFill: '/icons/solid-mood-happy.svg',
    moodNeutral: '/icons/mood-neutral.svg',
    moodNeutralFill: '/icons/solid-mood-neutral.svg',
    moodSad: '/icons/mood-sad.svg',
    moodSadFill: '/icons/solid-mood-sad.svg',
    xIcon: '/icons/icon_x.svg',
    linkedinIcon: '/icons/icon_linkedin.svg',
    facebookIcon: '/icons/icon_facebook.svg'
  },
  sounds: {
    backgroundMusic: '/sounds/background_music.mp3',
    buttonClick: '/sounds/button_click.mp3',
    callEnd: '/sounds/call_end.mp3',
    callFailure: '/sounds/call_failure.mp3',
    gameFailure: '/sounds/game_failure.mp3',
    gameJump: '/sounds/game_jump.mp3'
  }
}

// Helper function to get all video paths for preloading
export const getAllVideoPaths = () => Object.values(ASSET_PATHS.videos)

// Helper function to get all image paths for preloading
export const getAllImagePaths = () => Object.values(ASSET_PATHS.images)

// Helper function to get all icon paths for preloading
export const getAllIconPaths = () => Object.values(ASSET_PATHS.icons)

// Helper function to get all sound paths for preloading
export const getAllSoundPaths = () => Object.values(ASSET_PATHS.sounds)

// Helper function to get all asset paths (videos, images, icons, sounds) for preloading
export const getAllAssetPaths = () => ({
  videos: getAllVideoPaths(),
  images: getAllImagePaths(),
  icons: getAllIconPaths(),
  sounds: getAllSoundPaths()
})

