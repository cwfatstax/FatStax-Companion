function getTemplates() {
    
    let htmlTemplate = `<div class="outerTile">
    <a href="{{PRODUCT_JUMPLINK}}">
        <div class="outerImage">
            <img src="{{IMAGE_URL}}">
        </div>
        <div class="outerText">
            <div class="innerText">
                <p>{{NAME}}</p>
            </div>
        </div>
    </a>
</div>`;
    
    let cssTemplate = `<style>
    h1#productName,
    #fsButtonContainer {
        display: none;
    }

    #myContainer {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: flex-start;
        display: -webkit-flex;
        -webkit-flex-flow: row wrap;
        -webkit-justify-content: flex-start;
        -webkit-align-items: flex-start;
        -webkit-align-content: flex-start;
        margin: 0 auto;
        width: 684px;
    }

    .outerTile {
        flex: 0 1 auto;
        -webkit-box-flex: auto;
        width: 200px;
        height: 200px;
        margin: 13.68px;
        box-shadow: 1px 1px 4px 1px #ccc;
        border-radius: 5px;
    }

    .outerTile a {
        text-decoration: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        color: #504b49;
    }

    .outerImage {
        width: 200px;
        height: 120px;
        position: relative;
        background-color: {{TILE_COLOR}};
        border-radius: 5px 5px 0px 0px;
    }

    .outerImage img {
        max-width: 190px;
        max-height: 110.4px;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }

    .outerText {
        background-color: #efe9e6;
        border-radius: 0px 0px 5px 5px;
        height: 80px;
        box-sizing: border-box;
    }

    .innerText {
        text-align: center;
        height: 80px;
        width: 190px;
        margin: 0 auto;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        display: -webkit-flex;
        -webkit-align-items: center;
        -webkit-justify-content: center;
    }

    .innerText p {
        margin: 0px;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
        font-family: sans-serif;
        line-height: 18px;
    }

    /*Web specific*/

    @media all and (min-device-width: 1025px) {
        #myContainer {
            width: auto;
        }
        .outerTile:hover {
            animation-duration: .3s;
            -webkit-animation-duration: .3s;
            animation-name: bounceIn;
            -webkit-animation-name: bounceIn;
            animation-timing-function: linear;
        }
        @keyframes bounceIn {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(.99);
            }
            100% {
                transform: scale(1);
            }
        }
    }

    /*iPhone specific*/

    @media not all and (min-width: 704px) {
        .outerTile {
            width: 300px;
            height: 300px;
            margin: 20.52px;
        }
        .outerImage {
            width: 300px;
            height: 180px;
        }
        .outerImage img {
            max-width: 285px;
            max-height: 165.6px;
        }
        .outerText {
            height: 120px;
        }
        .innerText {
            height: 120px;
            width: 285px;
        }
        .outerText p {
            font-size: 24px;
            line-height: 26px;
        }
    }

</style>
<div id="myContainer">`;
    let tileColor = document.getElementById('tileColor').value;
    tileColor = tileColor.includes('#') ? tileColor : '#' + tileColor;
    cssTemplate = cssTemplate.replace('{{TILE_COLOR}}', tileColor);
    return [htmlTemplate, cssTemplate];
}
