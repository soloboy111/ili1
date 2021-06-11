const getInfo = () => {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `/api/json/${md5file}`,
            success: function(data) {
                $(".preloader").fadeOut("slow");
                if(data.status == 1) {
                    if(!data.isVip) showAds();
                    if(!isIos()) generatePlaylist(data.content.playlist);
                    else initPlayer(`/api/m3u8/${md5file}/master.m3u8`);
                } else {
                    reject(data.msg);
                }
            },
            error: function() {
                reject(data.msg);
            }
        });
    })
}
getInfo().catch((err) => {
    showError(err);
})