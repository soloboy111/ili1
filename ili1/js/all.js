const getParams = (name, url) => {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}
const initPlayer = (link) =>  {
    let autoplay = getParams("autoplay");
    if(!autoplay) autoplay = false;
    let mute = getParams("mute");
    if(!mute) mute = false;
    let thumb = getParams("thumb");
    let sub = getParams("sub");
    //player
    let player = jwplayer("mediaplayer");
    let object = {
        playbackRateControls: [0.75, 1, 1.25, 1.5, 2],
        autostart: autoplay,
        controls: true,
        volume: 75,
        primary: "html5",
        skin: {
            controlbar: {
                background: "rgba(0,0,0,0)",
                icons: "rgba(255,255,255,0.8)",
                iconsActive: "#FFFFFF",
                text: "#F2F2F2"
            },
            menus: {
                background: "#333333",
                text: "rgba(255,255,255,0.8)",
                textActive: "#FFFFFF"
            },
            timeslider: {
                progress: "#F2F2F2",
                rail: "rgba(255,255,255,0.3)"
            },
            tooltips: {
                background: "#FFFFFF",
                text: "#000000"
            }
        },
        stretching: "uniform",
        width: "100%",
        height: "100%",
        mute: mute,
        file: link,
        preload: "auto"
    };
    player.setup(object);
    $(".preloader").fadeOut("slow");
}
const url = getParams("url");
if(url) initPlayer(url);