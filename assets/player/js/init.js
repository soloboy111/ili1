const isIos = () => {
    return _iOSDevice = /iPhone|iPod|iPad|Mac/.test(navigator.platform);
}
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script= document.createElement('script');
        script.type= 'text/javascript';
        script.onload = () => {
            resolve("OK");
        };
        script.onerror = () => {
            console.log("Failed to load script", src);
            resolve("ERROR");
        };
        script.src = src;
        document.head.appendChild(script);
    });
}
const showAds = async() => {
    await loadScript("https://greenplasticdua.com/t/9/fret/meow4/1823353/brt.js");
}
const getParams = (name, url) => {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? null : results[1];
}
const loadStyle = (src) => {
    return new Promise((resolve, reject) => {
        const link= document.createElement('link');
        link.rel = 'stylesheet';
        link.type= 'text/css';
        link.onload = () => {
            resolve();
        };
        link.onerror = () => {
            console.log("Failed to load CSS", src);
            reject();
        };
        link.href = src;
        document.head.appendChild(link);
    });
}
const showError = async(msg) => {
    await loadStyle("/assets/player/css/error.css");
    $("body").html(`<div class="box">
        <div class="box__ghost">
        <div class="symbol"></div>
        <div class="symbol"></div>
        <div class="symbol"></div>
        <div class="symbol"></div>
        <div class="symbol"></div>
        <div class="symbol"></div>
        
        <div class="box__ghost-container">
            <div class="box__ghost-eyes">
            <div class="box__eye-left"></div>
            <div class="box__eye-right"></div>
            </div>
            <div class="box__ghost-bottom">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            </div>
        </div>
        <div class="box__ghost-shadow"></div>
        </div>
        
        <div class="box__description">
        <div class="box__description-container">
            <div class="box__description-title">Whoops!</div>
            <div class="box__description-text">${msg}</div>
        </div>
        
        </div>
    </div>`);
    await loadScript("/assets/player/js/error.js");
}
const getLanguage = () => {
    let lang = getCookie("lang");
    const langs = {
        vi: {
            forward: "Tua tiếp 10s",
            backward: "Tua lại 10s"
        },
        en: {
            forward: "Forward 10 seconds",
            backward: "Rewind 10 seconds"
        }
    }
    if(lang === "vi" || lang === "en") {
        return langs[lang];
    } else {
        lang = navigator.language || navigator.userLanguage;
        if(lang != "vi" && lang != "en") lang = "en";
        return langs[lang];
    }
}
function changeLanguage(lang) {
    setCookie("lang",lang);
    location.reload();
}
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
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
        type: "hls",
        preload: "auto",
        image: `/api/image/${md5file}`
    };
    if(config.logo) object.logo = config.logo;
    if(config.advertising) object.advertising = config.advertising;
    if(thumb) object.image = thumb;
    if(tracks) {
        object.tracks = JSON.parse(tracks);
    } else if(sub) {
        object.tracks = [{
            file: sub,
            label: "Sub",
            kind: "captions",
            default: true
        }]
    }
    const lang = getLanguage();
    player.setup(object);
    player.addButton("/assets/player/images/forward.svg", lang.forward, function () {
        player.seek(player.getPosition() + 10);
    }, lang.forward);
    player.addButton("/assets/player/images/backward.svg", lang.backward, function() {
        player.seek(player.getPosition() - 10);
    }, lang.backward);
}
const generatePlaylist = (playlist) => {
    let m3u8 = "#EXTM3U\n#EXT-X-VERSION:3\n";
    for(const item of playlist) {
        m3u8 += `#EXT-X-STREAM-INF:BANDWIDTH=${item.bandwidth},RESOLUTION=${item.resolution}\n`;
        let url = generateM3u8(item.content, item.duration);
        m3u8 += `${url}\n`;
    }
    const url = URL.createObjectURL(new Blob([m3u8], {type: "application/x-mpegURL"}));
    initPlayer(url);
}
const generateM3u8 = (content, duration) => {
    let m3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${duration}\n#EXT-X-PLAYLIST-TYPE:VOD\n`;
    for(const item of content) {
        m3u8 += `#EXTINF:${item.extinf}\n`;
        m3u8 += `${item.url}\n`;
    }
    m3u8 += "#EXT-X-ENDLIST";
    const url = URL.createObjectURL(new Blob([m3u8], {type: "application/x-mpegURL"}));
    return url;
}