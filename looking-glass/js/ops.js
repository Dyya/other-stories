"use strict";

var CABLES=CABLES||{};
CABLES.OPS=CABLES.OPS||{};

var Ops=Ops || {};
Ops.Gl=Ops.Gl || {};
Ops.Ui=Ops.Ui || {};
Ops.Anim=Ops.Anim || {};
Ops.Html=Ops.Html || {};
Ops.Math=Ops.Math || {};
Ops.Array=Ops.Array || {};
Ops.Color=Ops.Color || {};
Ops.Cables=Ops.Cables || {};
Ops.Boolean=Ops.Boolean || {};
Ops.Devices=Ops.Devices || {};
Ops.Gl.GLTF=Ops.Gl.GLTF || {};
Ops.Trigger=Ops.Trigger || {};
Ops.Gl.Phong=Ops.Gl.Phong || {};
Ops.Graphics=Ops.Graphics || {};
Ops.Html.CSS=Ops.Html.CSS || {};
Ops.WebAudio=Ops.WebAudio || {};
Ops.Extension=Ops.Extension || {};
Ops.Gl.Matrix=Ops.Gl.Matrix || {};
Ops.Gl.Meshes=Ops.Gl.Meshes || {};
Ops.Gl.Shader=Ops.Gl.Shader || {};
Ops.Array.Math=Ops.Array.Math || {};
Ops.Html.Utils=Ops.Html.Utils || {};
Ops.Devices.Mouse=Ops.Devices.Mouse || {};
Ops.Html.Elements=Ops.Html.Elements || {};
Ops.Devices.Mobile=Ops.Devices.Mobile || {};
Ops.Gl.ImageCompose=Ops.Gl.ImageCompose || {};
Ops.Graphics.Meshes=Ops.Graphics.Meshes || {};
Ops.Devices.Keyboard=Ops.Devices.Keyboard || {};
Ops.Extension.FxHash=Ops.Extension.FxHash || {};
Ops.Gl.ShaderEffects=Ops.Gl.ShaderEffects || {};
Ops.Extension.Deprecated=Ops.Extension.Deprecated || {};
Ops.Gl.ImageCompose.Noise=Ops.Gl.ImageCompose.Noise || {};



// **************************************************************
// 
// Ops.Gl.ImageCompose.DrawImage_v3
// 
// **************************************************************

Ops.Gl.ImageCompose.DrawImage_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"drawimage_frag":"#ifdef HAS_TEXTURES\n    IN vec2 texCoord;\n    UNI sampler2D tex;\n    UNI sampler2D image;\n#endif\n\n#ifdef TEX_TRANSFORM\n    IN mat3 transform;\n#endif\n// UNI float rotate;\n\n{{CGL.BLENDMODES}}\n\n#ifdef HAS_TEXTUREALPHA\n   UNI sampler2D imageAlpha;\n#endif\n\nUNI float amount;\n\n#ifdef ASPECT_RATIO\n    UNI float aspectTex;\n    UNI float aspectPos;\n#endif\n\nvoid main()\n{\n    vec4 blendRGBA=vec4(0.0,0.0,0.0,1.0);\n\n    #ifdef HAS_TEXTURES\n        vec2 tc=texCoord;\n\n        #ifdef TEX_FLIP_X\n            tc.x=1.0-tc.x;\n        #endif\n        #ifdef TEX_FLIP_Y\n            tc.y=1.0-tc.y;\n        #endif\n\n        #ifdef ASPECT_RATIO\n            #ifdef ASPECT_AXIS_X\n                tc.y=(1.0-aspectPos)-(((1.0-aspectPos)-tc.y)*aspectTex);\n            #endif\n            #ifdef ASPECT_AXIS_Y\n                tc.x=(1.0-aspectPos)-(((1.0-aspectPos)-tc.x)/aspectTex);\n            #endif\n        #endif\n\n        #ifdef TEX_TRANSFORM\n            vec3 coordinates=vec3(tc.x, tc.y,1.0);\n            tc=(transform * coordinates ).xy;\n        #endif\n\n        blendRGBA=texture(image,tc);\n\n        vec3 blend=blendRGBA.rgb;\n        vec4 baseRGBA=texture(tex,texCoord);\n        vec3 base=baseRGBA.rgb;\n\n\n        #ifdef PREMUL\n            blend.rgb = (blend.rgb) + (base.rgb * (1.0 - blendRGBA.a));\n        #endif\n\n        vec3 colNew=_blend(base,blend);\n\n\n\n\n        #ifdef REMOVE_ALPHA_SRC\n            blendRGBA.a=1.0;\n        #endif\n\n        #ifdef HAS_TEXTUREALPHA\n            vec4 colImgAlpha=texture(imageAlpha,tc);\n            float colImgAlphaAlpha=colImgAlpha.a;\n\n            #ifdef ALPHA_FROM_LUMINANCE\n                vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));\n                colImgAlphaAlpha=(gray.r+gray.g+gray.b)/3.0;\n            #endif\n\n            #ifdef ALPHA_FROM_INV_UMINANCE\n                vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));\n                colImgAlphaAlpha=1.0-(gray.r+gray.g+gray.b)/3.0;\n            #endif\n\n            #ifdef INVERT_ALPHA\n                colImgAlphaAlpha=clamp(colImgAlphaAlpha,0.0,1.0);\n                colImgAlphaAlpha=1.0-colImgAlphaAlpha;\n            #endif\n\n            blendRGBA.a=colImgAlphaAlpha*blendRGBA.a;\n        #endif\n    #endif\n\n    float am=amount;\n\n    #ifdef CLIP_REPEAT\n        if(tc.y>1.0 || tc.y<0.0 || tc.x>1.0 || tc.x<0.0)\n        {\n            // colNew.rgb=vec3(0.0);\n            am=0.0;\n        }\n    #endif\n\n    #ifdef ASPECT_RATIO\n        #ifdef ASPECT_CROP\n            if(tc.y>1.0 || tc.y<0.0 || tc.x>1.0 || tc.x<0.0)\n            {\n                colNew.rgb=base.rgb;\n                am=0.0;\n            }\n\n        #endif\n    #endif\n\n\n\n    #ifndef PREMUL\n        blendRGBA.rgb=mix(colNew,base,1.0-(am*blendRGBA.a));\n        blendRGBA.a=clamp(baseRGBA.a+(blendRGBA.a*am),0.,1.);\n    #endif\n\n    #ifdef PREMUL\n        // premultiply\n        // blendRGBA.rgb = (blendRGBA.rgb) + (baseRGBA.rgb * (1.0 - blendRGBA.a));\n        blendRGBA=vec4(\n            mix(colNew.rgb,base,1.0-(am*blendRGBA.a)),\n            blendRGBA.a*am+baseRGBA.a\n            );\n    #endif\n\n    #ifdef ALPHA_MASK\n    blendRGBA.a=baseRGBA.a;\n    #endif\n\n    outColor=blendRGBA;\n}\n\n\n\n\n\n\n\n","drawimage_vert":"IN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\n\nUNI mat4 projMatrix;\nUNI mat4 mvMatrix;\n\nOUT vec2 texCoord;\n// OUT vec3 norm;\n\n#ifdef TEX_TRANSFORM\n    UNI float posX;\n    UNI float posY;\n    UNI float scaleX;\n    UNI float scaleY;\n    UNI float rotate;\n    OUT mat3 transform;\n#endif\n\nvoid main()\n{\n   texCoord=attrTexCoord;\n//   norm=attrVertNormal;\n\n   #ifdef TEX_TRANSFORM\n        vec3 coordinates=vec3(attrTexCoord.x, attrTexCoord.y,1.0);\n        float angle = radians( rotate );\n        vec2 scale= vec2(scaleX,scaleY);\n        vec2 translate= vec2(posX,posY);\n\n        transform = mat3(   scale.x * cos( angle ), scale.x * sin( angle ), 0.0,\n            - scale.y * sin( angle ), scale.y * cos( angle ), 0.0,\n            - 0.5 * scale.x * cos( angle ) + 0.5 * scale.y * sin( angle ) - 0.5 * translate.x*2.0 + 0.5,  - 0.5 * scale.x * sin( angle ) - 0.5 * scale.y * cos( angle ) - 0.5 * translate.y*2.0 + 0.5, 1.0);\n   #endif\n\n   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode"),
    amount = op.inValueSlider("amount", 1),

    image = op.inTexture("Image"),
    inAlphaPremul = op.inValueBool("Premultiplied", false),
    inAlphaMask = op.inValueBool("Alpha Mask", false),
    removeAlphaSrc = op.inValueBool("removeAlphaSrc", false),

    imageAlpha = op.inTexture("Mask"),
    alphaSrc = op.inValueSelect("Mask Src", ["alpha channel", "luminance", "luminance inv"], "luminance"),
    invAlphaChannel = op.inBool("Invert alpha channel"),

    inAspect = op.inValueBool("Aspect Ratio", false),
    inAspectAxis = op.inValueSelect("Stretch Axis", ["X", "Y"], "X"),
    inAspectPos = op.inValueSlider("Position", 0.0),
    inAspectCrop = op.inValueBool("Crop", false),

    trigger = op.outTrigger("trigger");

blendMode.set("normal");
const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "drawimage");

imageAlpha.onLinkChanged = updateAlphaPorts;

op.setPortGroup("Aspect Ratio", [inAspect, inAspectPos, inAspectCrop, inAspectAxis]);
op.setPortGroup("Mask", [imageAlpha, alphaSrc, invAlphaChannel]);

function updateAlphaPorts()
{
    if (imageAlpha.isLinked())
    {
        removeAlphaSrc.setUiAttribs({ "greyout": true });
        alphaSrc.setUiAttribs({ "greyout": false });
        invAlphaChannel.setUiAttribs({ "greyout": false });
    }
    else
    {
        removeAlphaSrc.setUiAttribs({ "greyout": false });
        alphaSrc.setUiAttribs({ "greyout": true });
        invAlphaChannel.setUiAttribs({ "greyout": true });
    }
}

op.toWorkPortsNeedToBeLinked(image);

shader.setSource(attachments.drawimage_vert, attachments.drawimage_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureImaghe = new CGL.Uniform(shader, "t", "image", 1),
    textureAlpha = new CGL.Uniform(shader, "t", "imageAlpha", 2),
    uniTexAspect = new CGL.Uniform(shader, "f", "aspectTex", 1),
    uniAspectPos = new CGL.Uniform(shader, "f", "aspectPos", inAspectPos);

inAspect.onChange =
    inAspectCrop.onChange =
    inAspectAxis.onChange = updateAspectRatio;

function updateAspectRatio()
{
    shader.removeDefine("ASPECT_AXIS_X");
    shader.removeDefine("ASPECT_AXIS_Y");
    shader.removeDefine("ASPECT_CROP");

    inAspectPos.setUiAttribs({ "greyout": !inAspect.get() });
    inAspectCrop.setUiAttribs({ "greyout": !inAspect.get() });
    inAspectAxis.setUiAttribs({ "greyout": !inAspect.get() });

    if (inAspect.get())
    {
        shader.define("ASPECT_RATIO");

        if (inAspectCrop.get()) shader.define("ASPECT_CROP");

        if (inAspectAxis.get() == "X") shader.define("ASPECT_AXIS_X");
        if (inAspectAxis.get() == "Y") shader.define("ASPECT_AXIS_Y");
    }
    else
    {
        shader.removeDefine("ASPECT_RATIO");
        if (inAspectCrop.get()) shader.define("ASPECT_CROP");

        if (inAspectAxis.get() == "X") shader.define("ASPECT_AXIS_X");
        if (inAspectAxis.get() == "Y") shader.define("ASPECT_AXIS_Y");
    }
}

//
// texture flip
//
const flipX = op.inValueBool("flip x");
const flipY = op.inValueBool("flip y");

//
// texture transform
//

let doTransform = op.inValueBool("Transform");

let scaleX = op.inValueSlider("Scale X", 1);
let scaleY = op.inValueSlider("Scale Y", 1);

let posX = op.inValue("Position X", 0);
let posY = op.inValue("Position Y", 0);

let rotate = op.inValue("Rotation", 0);

const inClipRepeat = op.inValueBool("Clip Repeat", false);

const uniScaleX = new CGL.Uniform(shader, "f", "scaleX", scaleX);
const uniScaleY = new CGL.Uniform(shader, "f", "scaleY", scaleY);
const uniPosX = new CGL.Uniform(shader, "f", "posX", posX);
const uniPosY = new CGL.Uniform(shader, "f", "posY", posY);
const uniRotate = new CGL.Uniform(shader, "f", "rotate", rotate);

doTransform.onChange = updateTransformPorts;

function updateTransformPorts()
{
    shader.toggleDefine("TEX_TRANSFORM", doTransform.get());

    scaleX.setUiAttribs({ "greyout": !doTransform.get() });
    scaleY.setUiAttribs({ "greyout": !doTransform.get() });
    posX.setUiAttribs({ "greyout": !doTransform.get() });
    posY.setUiAttribs({ "greyout": !doTransform.get() });
    rotate.setUiAttribs({ "greyout": !doTransform.get() });
}

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

const amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

render.onTriggered = doRender;

inClipRepeat.onChange =
    imageAlpha.onChange =
    inAlphaPremul.onChange =
    inAlphaMask.onChange =
    invAlphaChannel.onChange =
    flipY.onChange =
    flipX.onChange =
    removeAlphaSrc.onChange =
    alphaSrc.onChange = updateDefines;

updateTransformPorts();
updateAlphaPorts();
updateAspectRatio();
updateDefines();

function updateDefines()
{
    shader.toggleDefine("REMOVE_ALPHA_SRC", removeAlphaSrc.get());
    shader.toggleDefine("ALPHA_MASK", inAlphaMask.get());

    shader.toggleDefine("CLIP_REPEAT", inClipRepeat.get());

    shader.toggleDefine("HAS_TEXTUREALPHA", imageAlpha.get() && imageAlpha.get().tex);

    shader.toggleDefine("TEX_FLIP_X", flipX.get());
    shader.toggleDefine("TEX_FLIP_Y", flipY.get());

    shader.toggleDefine("INVERT_ALPHA", invAlphaChannel.get());

    shader.toggleDefine("ALPHA_FROM_LUMINANCE", alphaSrc.get() == "luminance");
    shader.toggleDefine("ALPHA_FROM_INV_UMINANCE", alphaSrc.get() == "luminance_inv");
    shader.toggleDefine("PREMUL", inAlphaPremul.get());
}

function doRender()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    const tex = image.get();
    if (tex && tex.tex && amount.get() > 0.0)
    {
        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        const imgTex = cgl.currentTextureEffect.getCurrentSourceTexture();
        cgl.setTexture(0, imgTex.tex);

        // if (imgTex && tex)
        // {
        //     if (tex.textureType != imgTex.textureType && (tex.textureType == CGL.Texture.TYPE_FLOAT))
        //         op.setUiError("textypediff", "Drawing 32bit texture into an 8 bit can result in data/precision loss", 1);
        //     else
        //         op.setUiError("textypediff", null);
        // }

        const asp = 1 / (cgl.currentTextureEffect.getWidth() / cgl.currentTextureEffect.getHeight()) * (tex.width / tex.height);
        // uniTexAspect.setValue(1 / (tex.height / tex.width * imgTex.width / imgTex.height));

        uniTexAspect.setValue(asp);

        cgl.setTexture(1, tex.tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, image.get().tex );

        if (imageAlpha.get() && imageAlpha.get().tex)
        {
            cgl.setTexture(2, imageAlpha.get().tex);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, imageAlpha.get().tex );
        }

        // cgl.pushBlend(false);

        cgl.pushBlendMode(CGL.BLEND_NONE, true);

        cgl.currentTextureEffect.finish();
        cgl.popBlendMode();

        // cgl.popBlend();

        cgl.popShader();
    }

    trigger.trigger();
}

}
};






// **************************************************************
// 
// Ops.Trigger.Sequence
// 
// **************************************************************

Ops.Trigger.Sequence= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    cleanup = op.inTriggerButton("Clean up connections");

op.setUiAttrib({ "resizable": true, "resizableY": false, "stretchPorts": true });
const
    exes = [],
    triggers = [],
    num = 16;

let
    updateTimeout = null,
    connectedOuts = [];

exe.onTriggered = triggerAll;
cleanup.onTriggered = clean;
cleanup.setUiAttribs({ "hideParam": true, "hidePort": true });

for (let i = 0; i < num; i++)
{
    const p = op.outTrigger("trigger " + i);
    triggers.push(p);
    p.onLinkChanged = updateButton;

    if (i < num - 1)
    {
        let newExe = op.inTrigger("exe " + i);
        newExe.onTriggered = triggerAll;
        exes.push(newExe);
    }
}

updateConnected();

function updateConnected()
{
    connectedOuts.length = 0;
    for (let i = 0; i < triggers.length; i++)
        if (triggers[i].links.length > 0) connectedOuts.push(triggers[i]);
}

function updateButton()
{
    updateConnected();
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() =>
    {
        let show = false;
        for (let i = 0; i < triggers.length; i++)
            if (triggers[i].links.length > 1) show = true;

        cleanup.setUiAttribs({ "hideParam": !show });

        if (op.isCurrentUiOp()) op.refreshParams();
    }, 60);
}

function triggerAll()
{
    // for (let i = 0; i < triggers.length; i++) triggers[i].trigger();
    for (let i = 0; i < connectedOuts.length; i++) connectedOuts[i].trigger();
}

function clean()
{
    let count = 0;
    for (let i = 0; i < triggers.length; i++)
    {
        let removeLinks = [];

        if (triggers[i].links.length > 1)
            for (let j = 1; j < triggers[i].links.length; j++)
            {
                while (triggers[count].links.length > 0) count++;

                removeLinks.push(triggers[i].links[j]);
                const otherPort = triggers[i].links[j].getOtherPort(triggers[i]);
                op.patch.link(op, "trigger " + count, otherPort.op, otherPort.name);
                count++;
            }

        for (let j = 0; j < removeLinks.length; j++) removeLinks[j].remove();
    }
    updateButton();
    updateConnected();
}

}
};






// **************************************************************
// 
// Ops.Graphics.Transform
// 
// **************************************************************

Ops.Graphics.Transform= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    posX = op.inValue("posX", 0),
    posY = op.inValue("posY", 0),
    posZ = op.inValue("posZ", 0),
    scale = op.inValue("scale", 1),
    rotX = op.inValue("rotX", 0),
    rotY = op.inValue("rotY", 0),
    rotZ = op.inValue("rotZ", 0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Rotation", [rotX, rotY, rotZ]);
op.setPortGroup("Position", [posX, posY, posZ]);
op.setPortGroup("Scale", [scale]);
op.setUiAxisPorts(posX, posY, posZ);

op.toWorkPortsNeedToBeLinked(render, trigger);

const vPos = vec3.create();
const vScale = vec3.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);

let
    doScale = false,
    doTranslate = false,
    translationChanged = true,
    scaleChanged = true,
    rotChanged = true;

rotX.onChange = rotY.onChange = rotZ.onChange = setRotChanged;
posX.onChange = posY.onChange = posZ.onChange = setTranslateChanged;
scale.onChange = setScaleChanged;

render.onTriggered = function ()
{
    // if(!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    let updateMatrix = false;
    if (translationChanged)
    {
        updateTranslation();
        updateMatrix = true;
    }
    if (scaleChanged)
    {
        updateScale();
        updateMatrix = true;
    }
    if (rotChanged) updateMatrix = true;

    if (updateMatrix) doUpdateMatrix();

    const cg = op.patch.cg || op.patch.cgl;
    cg.pushModelMatrix();
    mat4.multiply(cg.mMatrix, cg.mMatrix, transMatrix);

    trigger.trigger();
    cg.popModelMatrix();

    if (CABLES.UI)
    {
        if (!posX.isLinked() && !posY.isLinked() && !posZ.isLinked())
        {
            gui.setTransform(op.id, posX.get(), posY.get(), posZ.get(), op.uiAttribs.comment);

            if (op.isCurrentUiOp())
                gui.setTransformGizmo({
                    "posX": posX,
                    "posY": posY,
                    "posZ": posZ,
                });
        }
    }
};

// op.transform3d = function ()
// {
//     return { "pos": [posX, posY, posZ] };
// };

function doUpdateMatrix()
{
    mat4.identity(transMatrix);
    if (doTranslate)mat4.translate(transMatrix, transMatrix, vPos);

    if (rotX.get() !== 0)mat4.rotateX(transMatrix, transMatrix, rotX.get() * CGL.DEG2RAD);
    if (rotY.get() !== 0)mat4.rotateY(transMatrix, transMatrix, rotY.get() * CGL.DEG2RAD);
    if (rotZ.get() !== 0)mat4.rotateZ(transMatrix, transMatrix, rotZ.get() * CGL.DEG2RAD);

    if (doScale)mat4.scale(transMatrix, transMatrix, vScale);
    rotChanged = false;
}

function updateTranslation()
{
    doTranslate = false;
    if (posX.get() !== 0.0 || posY.get() !== 0.0 || posZ.get() !== 0.0) doTranslate = true;
    vec3.set(vPos, posX.get(), posY.get(), posZ.get());
    translationChanged = false;
}

function updateScale()
{
    doScale = true;
    vec3.set(vScale, scale.get(), scale.get(), scale.get());
    scaleChanged = false;
}

function setTranslateChanged()
{
    translationChanged = true;
}

function setScaleChanged()
{
    scaleChanged = true;
}

function setRotChanged()
{
    rotChanged = true;
}

doUpdateMatrix();

}
};






// **************************************************************
// 
// Ops.Anim.Timer_v2
// 
// **************************************************************

Ops.Anim.Timer_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inSpeed = op.inValue("Speed", 1),
    playPause = op.inValueBool("Play", true),
    reset = op.inTriggerButton("Reset"),
    inSyncTimeline = op.inValueBool("Sync to timeline", false),
    outTime = op.outNumber("Time");

op.setPortGroup("Controls", [playPause, reset, inSpeed]);

const timer = new CABLES.Timer();
let lastTime = null;
let time = 0;
let syncTimeline = false;

playPause.onChange = setState;
setState();

function setState()
{
    if (playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered = doReset;

function doReset()
{
    time = 0;
    lastTime = null;
    timer.setTime(0);
    outTime.set(0);
}

inSyncTimeline.onChange = function ()
{
    syncTimeline = inSyncTimeline.get();
    playPause.setUiAttribs({ "greyout": syncTimeline });
    reset.setUiAttribs({ "greyout": syncTimeline });
};

op.onAnimFrame = function (tt, frameNum, deltaMs)
{
    if (timer.isPlaying())
    {
        if (CABLES.overwriteTime !== undefined)
        {
            outTime.set(CABLES.overwriteTime * inSpeed.get());
        }
        else

        if (syncTimeline)
        {
            outTime.set(tt * inSpeed.get());
        }
        else
        {
            timer.update();

            const timerVal = timer.get();

            if (lastTime === null)
            {
                lastTime = timerVal;
                return;
            }

            const t = Math.abs(timerVal - lastTime);
            lastTime = timerVal;

            time += t * inSpeed.get();
            if (time != time)time = 0;
            outTime.set(time);
        }
    }
};

}
};






// **************************************************************
// 
// Ops.Devices.Mouse.MouseButtons
// 
// **************************************************************

Ops.Devices.Mouse.MouseButtons= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    mouseClickLeft = op.outTrigger("Click Left"),
    mouseClickRight = op.outTrigger("Click Right"),
    mouseDoubleClick = op.outTrigger("Double Click"),
    mouseDownLeft = op.outBoolNum("Button pressed Left", false),
    mouseDownMiddle = op.outBoolNum("Button pressed Middle", false),
    mouseDownRight = op.outBoolNum("Button pressed Right", false),
    triggerMouseDownLeft = op.outTrigger("Mouse Down Left"),
    triggerMouseDownMiddle = op.outTrigger("Mouse Down Middle"),
    triggerMouseDownRight = op.outTrigger("Mouse Down Right"),
    triggerMouseUpLeft = op.outTrigger("Mouse Up Left"),
    triggerMouseUpMiddle = op.outTrigger("Mouse Up Middle"),
    triggerMouseUpRight = op.outTrigger("Mouse Up Right"),
    area = op.inValueSelect("Area", ["Canvas", "Document"], "Canvas"),
    active = op.inValueBool("Active", true);

const cgl = op.patch.cgl;
let listenerElement = null;
area.onChange = updateListeners;
op.onDelete = removeListeners;
updateListeners();

function onMouseDown(e)
{
    if (e.which == 1)
    {
        mouseDownLeft.set(true);
        triggerMouseDownLeft.trigger();
    }
    else if (e.which == 2)
    {
        mouseDownMiddle.set(true);
        triggerMouseDownMiddle.trigger();
    }
    else if (e.which == 3)
    {
        mouseDownRight.set(true);
        triggerMouseDownRight.trigger();
    }
}

function onMouseUp(e)
{
    if (e.which == 1 && mouseDownLeft.get())
    {
        mouseDownLeft.set(false);
        triggerMouseUpLeft.trigger();
    }
    else if (e.which == 2 && mouseDownMiddle.get())
    {
        mouseDownMiddle.set(false);
        triggerMouseUpMiddle.trigger();
    }
    else if (e.which == 3 && mouseDownRight.get())
    {
        mouseDownRight.set(false);
        triggerMouseUpRight.trigger();
    }
}

function onClickRight(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
}

function onDoubleClick(e)
{
    mouseDoubleClick.trigger();
}

function onmouseclick(e)
{
    mouseClickLeft.trigger();
}

function ontouchstart(event)
{
    if (event.touches && event.touches.length > 0)
    {
        event.touches[0].which = 1;
        onMouseDown(event.touches[0]);
    }
}

function ontouchend(event)
{
    onMouseUp({ "which": 1 });
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("touchend", ontouchend);
    listenerElement.removeEventListener("touchcancel", ontouchend);
    listenerElement.removeEventListener("touchstart", ontouchstart);
    listenerElement.removeEventListener("dblclick", onDoubleClick);
    listenerElement.removeEventListener("click", onmouseclick);
    listenerElement.removeEventListener("mousedown", onMouseDown);
    listenerElement.removeEventListener("mouseup", onMouseUp);
    listenerElement.removeEventListener("contextmenu", onClickRight);
    listenerElement.removeEventListener("mouseleave", onMouseUp);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = cgl.canvas;
    if (area.get() == "Document") listenerElement = document.body;

    listenerElement.addEventListener("touchend", ontouchend);
    listenerElement.addEventListener("touchcancel", ontouchend);
    listenerElement.addEventListener("touchstart", ontouchstart);
    listenerElement.addEventListener("dblclick", onDoubleClick);
    listenerElement.addEventListener("click", onmouseclick);
    listenerElement.addEventListener("mousedown", onMouseDown);
    listenerElement.addEventListener("mouseup", onMouseUp);
    listenerElement.addEventListener("contextmenu", onClickRight);
    listenerElement.addEventListener("mouseleave", onMouseUp);
}

op.onLoaded = updateListeners;

active.onChange = updateListeners;

function updateListeners()
{
    removeListeners();
    if (active.get()) addListeners();
}

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.CameraInfo
// 
// **************************************************************

Ops.Gl.Matrix.CameraInfo= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    cameraType = op.inSwitch("Camera Type", ["Perspective", "Orthographic"], "Perspective"),
    trigger = op.outTrigger("trigger"),
    outX = op.outNumber("X"),
    outY = op.outNumber("Y"),
    outZ = op.outNumber("Z"),
    outRightX = op.outNumber("Right X"),
    outRightY = op.outNumber("Right Y"),
    outRightZ = op.outNumber("Right Z"),
    outUpX = op.outNumber("Up X"),
    outUpY = op.outNumber("Up Y"),
    outUpZ = op.outNumber("Up Z"),
    outForwardX = op.outNumber("Forward X"),
    outForwardY = op.outNumber("Forward Y"),
    outForwardZ = op.outNumber("Forward Z"),
    outNear = op.outNumber("Near Frustum"),
    outFar = op.outNumber("Far Frustum"),
    outTop = op.outNumber("Bottom Frustum"),
    outBottom = op.outNumber("Top Frustum"),
    outLeft = op.outNumber("Left Frustum"),
    outRight = op.outNumber("Right Frustum"),
    outFov = op.outNumber("FOV"),
    outAspect = op.outNumber("Aspect Ratio");
const
    cgl = op.patch.cgl,
    pos = vec3.create(),
    identVec = vec3.create(),
    iViewMatrix = mat4.create();
render.onTriggered = update;

function update()
{
    mat4.invert(iViewMatrix, cgl.vMatrix);

    outRightX.set(iViewMatrix[0]);
    outRightY.set(iViewMatrix[1]);
    outRightZ.set(iViewMatrix[2]);

    outUpX.set(iViewMatrix[4]);
    outUpY.set(iViewMatrix[5]);
    outUpZ.set(iViewMatrix[6]);

    outForwardX.set(iViewMatrix[8]);
    outForwardY.set(iViewMatrix[9]);
    outForwardZ.set(iViewMatrix[10]);

    outX.set(iViewMatrix[12]);
    outY.set(iViewMatrix[13]);
    outZ.set(iViewMatrix[14]);

    // https://stackoverflow.com/questions/10830293/decompose-projection-matrix44-to-left-right-bottom-top-near-and-far-boundary/10836497#10836497
    const m11 = cgl.pMatrix[4 * 0 + 0];
    const m13 = cgl.pMatrix[4 * 2 + 0];
    const m14 = cgl.pMatrix[4 * 3 + 0];
    const m22 = cgl.pMatrix[4 * 1 + 1];
    const m23 = cgl.pMatrix[4 * 2 + 1];
    const m24 = cgl.pMatrix[4 * 3 + 1];
    const m33 = cgl.pMatrix[4 * 2 + 2];
    const m34 = cgl.pMatrix[4 * 3 + 2];

    // https://stackoverflow.com/questions/46182845/field-of-view-aspect-ratio-view-matrix-from-projection-matrix-hmd-ost-calib
    const FOV = 2 * Math.atan(1 / m22) * 180 / Math.PI;
    const aspectRatio = m22 / m11;

    outFov.set(FOV);
    outAspect.set(aspectRatio);
    if (cameraType.get() === "Perspective")
    {
        const near = m34 / (m33 - 1);
        const far = m34 / (m33 + 1);
        const top = near * (m23 + 1) / m22;
        const bottom = near * (m23 - 1) / m22;
        const left = near * (m13 - 1) / m11;
        const right = near * (m13 + 1) / m11;

        outNear.set(near);
        outFar.set(far);
        outTop.set(top);
        outBottom.set(bottom);
        outLeft.set(left);
        outRight.set(right);
    }
    else if (cameraType.get() === "Orthographic")
    {
        const near = (1 + m34) / m33;
        const far = -(1 - m34) / m33;
        const bottom = near * (m23 - 1) / m22;
        const top = near * (m23 + 1) / m22;
        const left = near * (m13 - 1) / m11;
        const right = near * (m13 + 1) / m11;

        outNear.set(near);
        outFar.set(far);
        outTop.set(top);
        outBottom.set(bottom);
        outLeft.set(left);
        outRight.set(right);
    }

    trigger.trigger();
}

}
};






// **************************************************************
// 
// Ops.Anim.SineAnim
// 
// **************************************************************

Ops.Anim.SineAnim= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    mode = op.inSwitch("Mode", ["Sine", "Cosine"], "Sine"),
    phase = op.inValueFloat("phase", 0),
    mul = op.inValueFloat("frequency", 1),
    amplitude = op.inValueFloat("amplitude", 1),
    trigOut = op.outTrigger("Trigger out"),
    result = op.outNumber("result");

let selectIndex = 0;
const SINE = 0;
const COSINE = 1;

op.toWorkPortsNeedToBeLinked(exe);

exe.onTriggered = exec;
mode.onChange = onModeChange;

exec();
onModeChange();

function onModeChange()
{
    let modeSelectValue = mode.get();

    if (modeSelectValue === "Sine") selectIndex = SINE;
    else if (modeSelectValue === "Cosine") selectIndex = COSINE;

    exec();
}

function exec()
{
    if (selectIndex == SINE) result.set(amplitude.get() * Math.sin((op.patch.freeTimer.get() * mul.get()) + phase.get()));
    else result.set(amplitude.get() * Math.cos((op.patch.freeTimer.get() * mul.get()) + phase.get()));
    trigOut.trigger();
}

}
};






// **************************************************************
// 
// Ops.Gl.Phong.PhongMaterial_v6
// 
// **************************************************************

Ops.Gl.Phong.PhongMaterial_v6= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"phong_frag":"IN vec3 viewDirection;\nIN vec3 normInterpolated;\nIN vec2 texCoord;\n\n#ifdef AO_CHAN_1\n    #ifndef ATTRIB_texCoord1\n        #define ATTRIB_texCoord1\n\n        IN vec2 texCoord1;\n    #endif\n#endif\n\n#ifdef HAS_TEXTURE_AO\nvec2 tcAo;\n#endif\n\n\n\n#ifdef ENABLE_FRESNEL\n    IN vec4 cameraSpace_pos;\n#endif\n\n// IN mat3 normalMatrix; // when instancing...\n\n#ifdef HAS_TEXTURE_NORMAL\n    IN mat3 TBN_Matrix; // tangent bitangent normal space transform matrix\n#endif\n\nIN vec3 fragPos;\nIN vec3 v_viewDirection;\n\nUNI vec4 inDiffuseColor;\nUNI vec4 inMaterialProperties;\n\n#ifdef ADD_EMISSIVE_COLOR\n    UNI vec4 inEmissiveColor; // .w = intensity\n#endif\n\n#ifdef ENABLE_FRESNEL\n    UNI mat4 viewMatrix;\n    UNI vec4 inFresnel;\n    UNI vec2 inFresnelWidthExponent;\n#endif\n\n#ifdef ENVMAP_MATCAP\n    IN vec3 viewSpaceNormal;\n    IN vec3 viewSpacePosition;\n#endif\n\nstruct Light {\n    vec3 color;\n    vec3 position;\n    vec3 specular;\n\n\n    // * SPOT LIGHT * //\n    #ifdef HAS_SPOT\n        vec3 conePointAt;\n        #define COSCONEANGLE x\n        #define COSCONEANGLEINNER y\n        #define SPOTEXPONENT z\n        vec3 spotProperties;\n    #endif\n\n    #define INTENSITY x\n    #define ATTENUATION y\n    #define FALLOFF z\n    #define RADIUS w\n    vec4 lightProperties;\n\n    int castLight;\n};\n\n/* CONSTANTS */\n#define NONE -1\n#define ALBEDO x\n#define ROUGHNESS y\n#define SHININESS z\n#define SPECULAR_AMT w\n#define NORMAL x\n#define AO y\n#define SPECULAR z\n#define EMISSIVE w\nconst float PI = 3.1415926535897932384626433832795;\nconst float TWO_PI = (2. * PI);\nconst float EIGHT_PI = (8. * PI);\n\n#define RECIPROCAL_PI 1./PI\n#define RECIPROCAL_PI2 RECIPROCAL_PI/2.\n\n// TEXTURES\n// #ifdef HAS_TEXTURES\n    UNI vec4 inTextureIntensities;\n\n    #ifdef HAS_TEXTURE_ENV\n        #ifdef TEX_FORMAT_CUBEMAP\n            UNI samplerCube texEnv;\n            #ifndef WEBGL1\n                #define SAMPLETEX textureLod\n            #endif\n            #ifdef WEBGL1\n                #define SAMPLETEX textureCubeLodEXT\n            #endif\n        #endif\n\n        #ifdef TEX_FORMAT_EQUIRECT\n            UNI sampler2D texEnv;\n            #ifdef WEBGL1\n                // #extension GL_EXT_shader_texture_lod : enable\n                #ifdef GL_EXT_shader_texture_lod\n                    #define textureLod texture2DLodEXT\n                #endif\n                // #define textureLod texture2D\n            #endif\n\n            #define SAMPLETEX sampleEquirect\n\n            const vec2 invAtan = vec2(0.1591, 0.3183);\n            vec4 sampleEquirect(sampler2D tex,vec3 direction,float lod)\n            {\n                #ifndef WEBGL1\n                    vec3 newDirection = normalize(direction);\n            \t\tvec2 sampleUV;\n            \t\tsampleUV.x = -1. * (atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.75);\n            \t\tsampleUV.y = asin( clamp(direction.y, -1., 1.) ) * RECIPROCAL_PI + 0.5;\n                #endif\n\n                #ifdef WEBGL1\n                    vec3 newDirection = normalize(direction);\n                \t\tvec2 sampleUV = vec2(atan(newDirection.z, newDirection.x), asin(newDirection.y+1e-6));\n                        sampleUV *= vec2(0.1591, 0.3183);\n                        sampleUV += 0.5;\n                #endif\n                return textureLod(tex, sampleUV, lod);\n            }\n        #endif\n        #ifdef ENVMAP_MATCAP\n            UNI sampler2D texEnv;\n            #ifdef WEBGL1\n                // #extension GL_EXT_shader_texture_lod : enable\n                #ifdef GL_EXT_shader_texture_lod\n                    #define textureLod texture2DLodEXT\n                #endif\n                // #define textureLod texture2D\n            #endif\n\n\n            // * taken & modified from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshmatcap_frag.glsl.js\n            vec2 getMatCapUV(vec3 viewSpacePosition, vec3 viewSpaceNormal) {\n                vec3 viewDir = normalize(-viewSpacePosition);\n            \tvec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));\n            \tvec3 y = normalize(cross(viewDir, x));\n            \tvec2 uv = vec2(dot(x, viewSpaceNormal), dot(y, viewSpaceNormal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks\n            \treturn uv;\n            }\n        #endif\n\n        UNI float inEnvMapIntensity;\n        UNI float inEnvMapWidth;\n    #endif\n\n    #ifdef HAS_TEXTURE_LUMINANCE_MASK\n        UNI sampler2D texLuminance;\n        UNI float inLuminanceMaskIntensity;\n    #endif\n\n    #ifdef HAS_TEXTURE_DIFFUSE\n        UNI sampler2D texDiffuse;\n    #endif\n\n    #ifdef HAS_TEXTURE_SPECULAR\n        UNI sampler2D texSpecular;\n    #endif\n\n    #ifdef HAS_TEXTURE_NORMAL\n        UNI sampler2D texNormal;\n    #endif\n\n    #ifdef HAS_TEXTURE_AO\n        UNI sampler2D texAO;\n    #endif\n\n    #ifdef HAS_TEXTURE_EMISSIVE\n        UNI sampler2D texEmissive;\n    #endif\n\n    #ifdef HAS_TEXTURE_EMISSIVE_MASK\n        UNI sampler2D texMaskEmissive;\n        UNI float inEmissiveMaskIntensity;\n    #endif\n    #ifdef HAS_TEXTURE_ALPHA\n        UNI sampler2D texAlpha;\n    #endif\n// #endif\n\n{{MODULES_HEAD}}\n\nfloat when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function\nfloat when_lt(float x, float y) { return max(sign(y - x), 0.0); }\nfloat when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function\nfloat when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function\nfloat when_ge(float x, float y) { return 1.0 - when_lt(x, y); }\nfloat when_le(float x, float y) { return 1.0 - when_gt(x, y); }\n\n#ifdef FALLOFF_MODE_A\n    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {\n        // * original falloff\n        float denom = distance / radius + 1.0;\n        float attenuation = 1.0 / (denom*denom);\n        float t = (attenuation - falloff) / (1.0 - falloff);\n        return max(t, 0.0);\n    }\n#endif\n\n#ifdef FALLOFF_MODE_B\n    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {\n        float distanceSquared = dot(lightDirection, lightDirection);\n        float factor = distanceSquared * falloff;\n        float smoothFactor = clamp(1. - factor * factor, 0., 1.);\n        float attenuation = smoothFactor * smoothFactor;\n\n        return attenuation * 1. / max(distanceSquared, 0.00001);\n    }\n#endif\n\n#ifdef FALLOFF_MODE_C\n    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {\n        // https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf\n        float falloffNumerator = 1. - pow(distance/radius, 4.);\n        falloffNumerator = clamp(falloffNumerator, 0., 1.);\n        falloffNumerator *= falloffNumerator;\n\n        float denominator = distance*distance + falloff;\n\n        return falloffNumerator/denominator;\n    }\n#endif\n\n#ifdef FALLOFF_MODE_D\n    float CalculateFalloff(float distance, vec3 lightDirection, float falloff, float radius) {\n        // inverse square falloff, \"physically correct\"\n        return 1.0 / max(distance * distance, 0.0001);\n    }\n#endif\n\n#ifdef ENABLE_FRESNEL\n    float CalculateFresnel(vec3 direction, vec3 normal)\n    {\n        vec3 nDirection = normalize( direction );\n        vec3 nNormal = normalize( mat3(viewMatrix) * normal );\n        vec3 halfDirection = normalize( nNormal + nDirection );\n\n        float cosine = dot( halfDirection, nDirection );\n        float product = max( cosine, 0.0 );\n        float factor = pow(product, inFresnelWidthExponent.y);\n\n        return 5. * factor;\n    }\n#endif\n\n#ifdef CONSERVE_ENERGY\n    // http://www.rorydriscoll.com/2009/01/25/energy-conservation-in-games/\n    // http://www.farbrausch.de/~fg/articles/phong.pdf\n    float EnergyConservation(float shininess) {\n        #ifdef SPECULAR_PHONG\n            return (shininess + 2.)/TWO_PI;\n        #endif\n        #ifdef SPECULAR_BLINN\n            return (shininess + 8.)/EIGHT_PI;\n        #endif\n\n        #ifdef SPECULAR_SCHLICK\n            return (shininess + 8.)/EIGHT_PI;\n        #endif\n\n        #ifdef SPECULAR_GAUSS\n            return (shininess + 8.)/EIGHT_PI;\n        #endif\n    }\n#endif\n\n#ifdef ENABLE_OREN_NAYAR_DIFFUSE\n    float CalculateOrenNayar(vec3 lightDirection, vec3 viewDirection, vec3 normal) {\n        float LdotV = dot(lightDirection, viewDirection);\n        float NdotL = dot(lightDirection, normal);\n        float NdotV = dot(normal, viewDirection);\n\n        float albedo = inMaterialProperties.ALBEDO;\n        albedo *= 1.8;\n        float s = LdotV - NdotL * NdotV;\n        float t = mix(1., max(NdotL, NdotV), step(0., s));\n\n        float roughness = inMaterialProperties.ROUGHNESS;\n        float sigma2 = roughness * roughness;\n        float A = 1. + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));\n        float B = 0.45 * sigma2 / (sigma2 + 0.09);\n\n        float factor = albedo * max(0., NdotL) * (A + B * s / t) / PI;\n\n        return factor;\n\n    }\n#endif\n\nvec3 CalculateDiffuseColor(\n    vec3 lightDirection,\n    vec3 viewDirection,\n    vec3 normal,\n    vec3 lightColor,\n    vec3 materialColor,\n    inout float lambert\n) {\n    #ifndef ENABLE_OREN_NAYAR_DIFFUSE\n        lambert = clamp(dot(lightDirection, normal), 0., 1.);\n    #endif\n\n    #ifdef ENABLE_OREN_NAYAR_DIFFUSE\n        lambert = CalculateOrenNayar(lightDirection, viewDirection, normal);\n    #endif\n\n    vec3 diffuseColor = lambert * lightColor * materialColor;\n    return diffuseColor;\n}\n\nvec3 CalculateSpecularColor(\n    vec3 specularColor,\n    float specularCoefficient,\n    float shininess,\n    vec3 lightDirection,\n    vec3 viewDirection,\n    vec3 normal,\n    float lambertian\n) {\n    vec3 resultColor = vec3(0.);\n\n    #ifdef SPECULAR_PHONG\n        vec3 reflectDirection = reflect(-lightDirection, normal);\n        float specularAngle = max(dot(reflectDirection, viewDirection), 0.);\n        float specularFactor = pow(specularAngle, max(0., shininess));\n    resultColor = lambertian * specularFactor * specularCoefficient * specularColor;\n    #endif\n\n    #ifdef SPECULAR_BLINN\n        vec3 halfDirection = normalize(lightDirection + viewDirection);\n        float specularAngle = max(dot(halfDirection, normal), 0.);\n        float specularFactor = pow(specularAngle, max(0., shininess));\n        resultColor = lambertian * specularFactor * specularCoefficient * specularColor;\n    #endif\n\n    #ifdef SPECULAR_SCHLICK\n        vec3 halfDirection = normalize(lightDirection + viewDirection);\n        float specularAngle = dot(halfDirection, normal);\n        float schlickShininess = max(0., shininess);\n        float specularFactor = specularAngle / (schlickShininess - schlickShininess*specularAngle + specularAngle);\n        resultColor = lambertian * specularFactor * specularCoefficient * specularColor;\n    #endif\n\n    #ifdef SPECULAR_GAUSS\n        vec3 halfDirection = normalize(lightDirection + viewDirection);\n        float specularAngle = acos(max(dot(halfDirection, normal), 0.));\n        float exponent = specularAngle * shininess * 0.17;\n        exponent = -(exponent*exponent);\n        float specularFactor = exp(exponent);\n\n        resultColor = lambertian * specularFactor * specularCoefficient * specularColor;\n    #endif\n\n    #ifdef CONSERVE_ENERGY\n        float conserveEnergyFactor = EnergyConservation(shininess);\n        resultColor = conserveEnergyFactor * resultColor;\n    #endif\n\n    return resultColor;\n}\n\n#ifdef HAS_SPOT\n    float CalculateSpotLightEffect(vec3 lightPosition, vec3 conePointAt, float cosConeAngle, float cosConeAngleInner, float spotExponent, vec3 lightDirection) {\n        vec3 spotLightDirection = normalize(lightPosition-conePointAt);\n        float spotAngle = dot(-lightDirection, spotLightDirection);\n        float epsilon = cosConeAngle - cosConeAngleInner;\n\n        float spotIntensity = clamp((spotAngle - cosConeAngle)/epsilon, 0.0, 1.0);\n        spotIntensity = pow(spotIntensity, max(0.01, spotExponent));\n\n        return max(0., spotIntensity);\n    }\n#endif\n\n\n\n{{PHONG_FRAGMENT_HEAD}}\n\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n\n    vec4 col=vec4(0., 0., 0., inDiffuseColor.a);\n    vec3 calculatedColor = vec3(0.);\n    vec3 normal = normalize(normInterpolated);\n    vec3 baseColor = inDiffuseColor.rgb;\n\n    {{MODULE_BASE_COLOR}}\n\n\n\n    #ifdef AO_CHAN_0\n        vec2 tcAo=texCoord;\n    #endif\n    #ifdef AO_CHAN_1\n        vec2 tcAo=texCoord1;\n    #endif\n\n\n    vec3 viewDirection = normalize(v_viewDirection);\n\n    #ifdef DOUBLE_SIDED\n        if(!gl_FrontFacing) normal = normal * -1.0;\n    #endif\n\n    #ifdef HAS_TEXTURES\n        #ifdef HAS_TEXTURE_DIFFUSE\n            baseColor = texture(texDiffuse, texCoord).rgb;\n\n            #ifdef COLORIZE_TEXTURE\n                baseColor *= inDiffuseColor.rgb;\n            #endif\n        #endif\n\n        #ifdef HAS_TEXTURE_NORMAL\n            normal = texture(texNormal, texCoord).rgb;\n            normal = normalize(normal * 2. - 1.);\n            float normalIntensity = inTextureIntensities.NORMAL;\n            normal = normalize(mix(vec3(0., 0., 1.), normal, 2. * normalIntensity));\n            normal = normalize(TBN_Matrix * normal);\n        #endif\n    #endif\n\n    {{PHONG_FRAGMENT_BODY}}\n\n\n\n\n\n\n    #ifdef ENABLE_FRESNEL\n        calculatedColor += inFresnel.rgb * (CalculateFresnel(vec3(cameraSpace_pos), normal) * inFresnel.w * inFresnelWidthExponent.x);\n    #endif\n\n     #ifdef HAS_TEXTURE_ALPHA\n        #ifdef ALPHA_MASK_ALPHA\n            col.a*=texture(texAlpha,texCoord).a;\n        #endif\n        #ifdef ALPHA_MASK_LUMI\n            col.a*= dot(vec3(0.2126,0.7152,0.0722), texture(texAlpha,texCoord).rgb);\n        #endif\n        #ifdef ALPHA_MASK_R\n            col.a*=texture(texAlpha,texCoord).r;\n        #endif\n        #ifdef ALPHA_MASK_G\n            col.a*=texture(texAlpha,texCoord).g;\n        #endif\n        #ifdef ALPHA_MASK_B\n            col.a*=texture(texAlpha,texCoord).b;\n        #endif\n    #endif\n\n    #ifdef DISCARDTRANS\n        if(col.a<0.2) discard;\n    #endif\n\n\n    #ifdef HAS_TEXTURE_ENV\n        vec3 luminanceColor = vec3(0.);\n\n        #ifndef ENVMAP_MATCAP\n            float environmentMapWidth = inEnvMapWidth;\n            float glossyExponent = inMaterialProperties.SHININESS;\n            float glossyCoefficient = inMaterialProperties.SPECULAR_AMT;\n\n            vec3 envMapNormal =  normal;\n            vec3 reflectDirection = reflect(normalize(-viewDirection), normal);\n\n            float lambertianCoefficient = dot(viewDirection, reflectDirection); //0.44; // TODO: need prefiltered map for this\n            // lambertianCoefficient = 1.;\n            float specularAngle = max(dot(reflectDirection, viewDirection), 0.);\n            float specularFactor = pow(specularAngle, max(0., inMaterialProperties.SHININESS));\n\n            glossyExponent = specularFactor;\n\n            float maxMIPLevel = 10.;\n            float MIPlevel = log2(environmentMapWidth / 1024. * sqrt(3.)) - 0.5 * log2(glossyExponent + 1.);\n\n            luminanceColor = inEnvMapIntensity * (\n                inDiffuseColor.rgb *\n                SAMPLETEX(texEnv, envMapNormal, maxMIPLevel).rgb\n                +\n                glossyCoefficient * SAMPLETEX(texEnv, reflectDirection, MIPlevel).rgb\n            );\n        #endif\n        #ifdef ENVMAP_MATCAP\n            luminanceColor = inEnvMapIntensity * (\n                texture(texEnv, getMatCapUV(viewSpacePosition, viewSpaceNormal)).rgb\n                //inDiffuseColor.rgb\n                //* textureLod(texEnv, getMatCapUV(envMapNormal), maxMIPLevel).rgb\n                //+\n                //glossyCoefficient * textureLod(texEnv, getMatCapUV(reflectDirection), MIPlevel).rgb\n            );\n        #endif\n\n\n\n        #ifdef HAS_TEXTURE_LUMINANCE_MASK\n            luminanceColor *= texture(texLuminance, texCoord).r * inLuminanceMaskIntensity;\n        #endif\n\n        #ifdef HAS_TEXTURE_AO\n            luminanceColor *= texture(texAO, tcAo).r*inTextureIntensities.AO;\n        #endif\n\n        #ifdef ENV_BLEND_ADD\n            calculatedColor.rgb += luminanceColor;\n        #endif\n        #ifdef ENV_BLEND_MUL\n            calculatedColor.rgb *= luminanceColor;\n        #endif\n\n        #ifdef ENV_BLEND_MIX\n            calculatedColor.rgb=mix(luminanceColor,calculatedColor.rgb,luminanceColor);\n        #endif\n\n\n    #endif\n\n    #ifdef ADD_EMISSIVE_COLOR\n        vec3 emissiveRadiance = mix(calculatedColor, inEmissiveColor.rgb, inEmissiveColor.w); // .w = intensity of color;\n\n        #ifdef HAS_TEXTURE_EMISSIVE\n            float emissiveIntensity = inTextureIntensities.EMISSIVE;\n            emissiveRadiance = mix(calculatedColor, texture(texEmissive, texCoord).rgb, emissiveIntensity);\n        #endif\n\n        #ifdef HAS_TEXTURE_EMISSIVE_MASK\n           float emissiveMixValue = mix(1., texture(texMaskEmissive, texCoord).r, inEmissiveMaskIntensity);\n           calculatedColor = mix(calculatedColor, emissiveRadiance, emissiveMixValue);\n        #endif\n\n        #ifndef HAS_TEXTURE_EMISSIVE_MASK\n            calculatedColor = emissiveRadiance;\n        #endif\n    #endif\n\n    col.rgb = clamp(calculatedColor, 0., 1.);\n\n\n    {{MODULE_COLOR}}\n\n    outColor = col;\n\n}\n","phong_vert":"\n{{MODULES_HEAD}}\n\n#define NONE -1\n#define AMBIENT 0\n#define POINT 1\n#define DIRECTIONAL 2\n#define SPOT 3\n\n#define TEX_REPEAT_X x;\n#define TEX_REPEAT_Y y;\n#define TEX_OFFSET_X z;\n#define TEX_OFFSET_Y w;\n\nIN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\nIN float attrVertIndex;\nIN vec3 attrTangent;\nIN vec3 attrBiTangent;\n\nOUT vec2 texCoord;\nOUT vec3 normInterpolated;\nOUT vec3 fragPos;\n\n#ifdef AO_CHAN_1\n    #ifndef ATTRIB_attrTexCoord1\n        IN vec2 attrTexCoord1;\n        OUT vec2 texCoord1;\n        #define ATTRIB_attrTexCoord1\n        #define ATTRIB_texCoord1\n    #endif\n#endif\n\n#ifdef HAS_TEXTURE_NORMAL\n    OUT mat3 TBN_Matrix; // tangent bitangent normal space transform matrix\n#endif\n\n#ifdef ENABLE_FRESNEL\n    OUT vec4 cameraSpace_pos;\n#endif\n\nOUT vec3 v_viewDirection;\nOUT mat3 normalMatrix;\nOUT mat4 mvMatrix;\n\n#ifdef HAS_TEXTURES\n    UNI vec4 inTextureRepeatOffset;\n#endif\n\nUNI vec3 camPos;\nUNI mat4 projMatrix;\nUNI mat4 viewMatrix;\nUNI mat4 modelMatrix;\n\n#ifdef ENVMAP_MATCAP\n    OUT vec3 viewSpaceNormal;\n    OUT vec3 viewSpacePosition;\n#endif\n\n\nmat3 transposeMat3(mat3 m)\n{\n    return mat3(m[0][0], m[1][0], m[2][0],\n        m[0][1], m[1][1], m[2][1],\n        m[0][2], m[1][2], m[2][2]);\n}\n\nmat3 inverseMat3(mat3 m)\n{\n    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n    float b01 = a22 * a11 - a12 * a21;\n    float b11 = -a22 * a10 + a12 * a20;\n    float b21 = a21 * a10 - a11 * a20;\n\n    float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n        b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n        b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nvoid main()\n{\n    mat4 mMatrix=modelMatrix;\n    vec4 pos=vec4(vPosition,  1.0);\n\n    texCoord=attrTexCoord;\n    texCoord.y = 1. - texCoord.y;\n\n    #ifdef ATTRIB_texCoord1\n        texCoord1=attrTexCoord1;\n    #endif\n\n    vec3 norm=attrVertNormal;\n    vec3 tangent = attrTangent;\n    vec3 bitangent = attrBiTangent;\n\n    {{MODULE_VERTEX_POSITION}}\n\n    normalMatrix = transposeMat3(inverseMat3(mat3(mMatrix)));\n    mvMatrix = (viewMatrix * mMatrix);\n\n\n\n    #ifdef ENABLE_FRESNEL\n        cameraSpace_pos = mvMatrix * pos;\n    #endif\n\n    #ifdef HAS_TEXTURES\n        float repeatX = inTextureRepeatOffset.TEX_REPEAT_X;\n        float offsetX = inTextureRepeatOffset.TEX_OFFSET_X;\n        float repeatY = inTextureRepeatOffset.TEX_REPEAT_Y;\n        float offsetY = inTextureRepeatOffset.TEX_OFFSET_Y;\n\n        texCoord.x *= repeatX;\n        texCoord.x += offsetX;\n        texCoord.y *= repeatY;\n        texCoord.y += offsetY;\n    #endif\n\n   normInterpolated = vec3(normalMatrix*norm);\n\n    #ifdef HAS_TEXTURE_NORMAL\n        vec3 normCameraSpace = normalize((vec4(normInterpolated, 0.0)).xyz);\n        vec3 tangCameraSpace = normalize((mMatrix * vec4(tangent, 0.0)).xyz);\n        vec3 bitangCameraSpace = normalize((mMatrix * vec4(bitangent, 0.0)).xyz);\n\n        // re orthogonalization for smoother normals\n        tangCameraSpace = normalize(tangCameraSpace - dot(tangCameraSpace, normCameraSpace) * normCameraSpace);\n        bitangCameraSpace = cross(normCameraSpace, tangCameraSpace);\n\n        TBN_Matrix = mat3(tangCameraSpace, bitangCameraSpace, normCameraSpace);\n    #endif\n\n    fragPos = vec3((mMatrix) * pos);\n    v_viewDirection = normalize(camPos - fragPos);\n    // modelPos=mMatrix*pos;\n\n    #ifdef ENVMAP_MATCAP\n        mat3 viewSpaceNormalMatrix = normalMatrix = transposeMat3(inverseMat3(mat3(mvMatrix)));\n        viewSpaceNormal = normalize(viewSpaceNormalMatrix * norm);\n        viewSpacePosition = vec3(mvMatrix * pos);\n    #endif\n\n    mat4 modelViewMatrix=mvMatrix;\n    {{MODULE_VERTEX_MODELVIEW}}\n\n\n    gl_Position = projMatrix * modelViewMatrix * pos;\n}\n","snippet_body_ambient_frag":"    // * AMBIENT LIGHT {{LIGHT_INDEX}} *\n    vec3 diffuseColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY*phongLight{{LIGHT_INDEX}}.color;\n    calculatedColor += diffuseColor{{LIGHT_INDEX}};\n","snippet_body_directional_frag":"    // * DIRECTIONAL LIGHT {{LIGHT_INDEX}} *\n\n    if (phongLight{{LIGHT_INDEX}}.castLight == 1) {\n        vec3 phongLightDirection{{LIGHT_INDEX}} = normalize(phongLight{{LIGHT_INDEX}}.position);\n\n        float phongLambert{{LIGHT_INDEX}} = 1.; // inout variable\n\n        vec3 lightColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.color;\n        vec3 lightSpecular{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.specular;\n\n        #ifdef HAS_TEXTURES\n            #ifdef HAS_TEXTURE_AO\n                // lightColor{{LIGHT_INDEX}} *= mix(vec3(1.), texture(texAO, texCoord).rgb, inTextureIntensities.AO);\n                lightColor{{LIGHT_INDEX}} *= texture(texAO, tcAo).g, inTextureIntensities.AO;\n\n            #endif\n\n            #ifdef HAS_TEXTURE_SPECULAR\n                lightSpecular{{LIGHT_INDEX}} *= mix(1., texture(texSpecular, texCoord).r, inTextureIntensities.SPECULAR);\n            #endif\n        #endif\n\n        vec3 diffuseColor{{LIGHT_INDEX}} = CalculateDiffuseColor(phongLightDirection{{LIGHT_INDEX}}, viewDirection, normal, lightColor{{LIGHT_INDEX}}, baseColor, phongLambert{{LIGHT_INDEX}});\n        vec3 specularColor{{LIGHT_INDEX}} = CalculateSpecularColor(\n            lightSpecular{{LIGHT_INDEX}},\n            inMaterialProperties.SPECULAR_AMT,\n            inMaterialProperties.SHININESS,\n            phongLightDirection{{LIGHT_INDEX}},\n            viewDirection,\n            normal,\n            phongLambert{{LIGHT_INDEX}}\n        );\n\n        vec3 combinedColor{{LIGHT_INDEX}} = (diffuseColor{{LIGHT_INDEX}} + specularColor{{LIGHT_INDEX}});\n\n        vec3 lightModelDiff{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;\n\n        combinedColor{{LIGHT_INDEX}} *= phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY;\n        calculatedColor += combinedColor{{LIGHT_INDEX}};\n    }","snippet_body_point_frag":"// * POINT LIGHT {{LIGHT_INDEX}} *\n    if (phongLight{{LIGHT_INDEX}}.castLight == 1) {\n        vec3 phongLightDirection{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;\n        // * get length before normalization for falloff calculation\n        phongLightDirection{{LIGHT_INDEX}} = normalize(phongLightDirection{{LIGHT_INDEX}});\n        float phongLightDistance{{LIGHT_INDEX}} = length(phongLightDirection{{LIGHT_INDEX}});\n\n        float phongLambert{{LIGHT_INDEX}} = 1.; // inout variable\n\n        vec3 lightColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.color;\n        vec3 lightSpecular{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.specular;\n\n        #ifdef HAS_TEXTURES\n            #ifdef HAS_TEXTURE_AO\n                lightColor{{LIGHT_INDEX}} -= (1.0-texture(texAO, tcAo).g)* (inTextureIntensities.AO);\n            #endif\n\n            #ifdef HAS_TEXTURE_SPECULAR\n                lightSpecular{{LIGHT_INDEX}} *= mix(1., texture(texSpecular, texCoord).r, inTextureIntensities.SPECULAR);\n            #endif\n        #endif\n\n        vec3 diffuseColor{{LIGHT_INDEX}} = CalculateDiffuseColor(phongLightDirection{{LIGHT_INDEX}}, viewDirection, normal, lightColor{{LIGHT_INDEX}}, baseColor, phongLambert{{LIGHT_INDEX}});\n        vec3 specularColor{{LIGHT_INDEX}} = CalculateSpecularColor(\n            lightSpecular{{LIGHT_INDEX}},\n            inMaterialProperties.SPECULAR_AMT,\n            inMaterialProperties.SHININESS,\n            phongLightDirection{{LIGHT_INDEX}},\n            viewDirection,\n            normal,\n            phongLambert{{LIGHT_INDEX}}\n        );\n\n        vec3 combinedColor{{LIGHT_INDEX}} = (diffuseColor{{LIGHT_INDEX}} + specularColor{{LIGHT_INDEX}});\n\n        combinedColor{{LIGHT_INDEX}} *= phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY;\n\n        float attenuation{{LIGHT_INDEX}} = CalculateFalloff(\n            phongLightDistance{{LIGHT_INDEX}},\n            phongLightDirection{{LIGHT_INDEX}},\n            phongLight{{LIGHT_INDEX}}.lightProperties.FALLOFF,\n            phongLight{{LIGHT_INDEX}}.lightProperties.RADIUS\n        );\n\n        attenuation{{LIGHT_INDEX}} *= when_gt(phongLambert{{LIGHT_INDEX}}, 0.);\n        combinedColor{{LIGHT_INDEX}} *= attenuation{{LIGHT_INDEX}};\n\n        calculatedColor += combinedColor{{LIGHT_INDEX}};\n    }\n","snippet_body_spot_frag":"    // * SPOT LIGHT {{LIGHT_INDEX}} *\n    if (phongLight{{LIGHT_INDEX}}.castLight == 1) {\n        vec3 phongLightDirection{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;\n        phongLightDirection{{LIGHT_INDEX}} = normalize( phongLightDirection{{LIGHT_INDEX}});\n        float phongLightDistance{{LIGHT_INDEX}} = length(phongLightDirection{{LIGHT_INDEX}});\n\n        float phongLambert{{LIGHT_INDEX}} = 1.; // inout variable\n\n        vec3 lightColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.color;\n        vec3 lightSpecular{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.specular;\n\n        #ifdef HAS_TEXTURES\n            #ifdef HAS_TEXTURE_AO\n                // lightColor{{LIGHT_INDEX}} *= mix(vec3(1.), texture(texAO, texCoord).rgb, inTextureIntensities.AO);\n                lightColor{{LIGHT_INDEX}} *= texture(texAO, texCoord).g, inTextureIntensities.AO;\n\n            #endif\n\n            #ifdef HAS_TEXTURE_SPECULAR\n                lightSpecular{{LIGHT_INDEX}} *= mix(1., texture(texSpecular, texCoord).r, inTextureIntensities.SPECULAR);\n            #endif\n        #endif\n\n        vec3 diffuseColor{{LIGHT_INDEX}} = CalculateDiffuseColor(phongLightDirection{{LIGHT_INDEX}}, viewDirection, normal, lightColor{{LIGHT_INDEX}}, baseColor, phongLambert{{LIGHT_INDEX}});\n        vec3 specularColor{{LIGHT_INDEX}} = CalculateSpecularColor(\n            lightSpecular{{LIGHT_INDEX}},\n            inMaterialProperties.SPECULAR_AMT,\n            inMaterialProperties.SHININESS,\n            phongLightDirection{{LIGHT_INDEX}},\n            viewDirection,\n            normal,\n            phongLambert{{LIGHT_INDEX}}\n        );\n\n        vec3 combinedColor{{LIGHT_INDEX}} = (diffuseColor{{LIGHT_INDEX}} + specularColor{{LIGHT_INDEX}});\n\n        float spotIntensity{{LIGHT_INDEX}} = CalculateSpotLightEffect(\n            phongLight{{LIGHT_INDEX}}.position, phongLight{{LIGHT_INDEX}}.conePointAt, phongLight{{LIGHT_INDEX}}.spotProperties.COSCONEANGLE,\n            phongLight{{LIGHT_INDEX}}.spotProperties.COSCONEANGLEINNER, phongLight{{LIGHT_INDEX}}.spotProperties.SPOTEXPONENT,\n            phongLightDirection{{LIGHT_INDEX}}\n        );\n\n        combinedColor{{LIGHT_INDEX}} *= spotIntensity{{LIGHT_INDEX}};\n\n        vec3 lightModelDiff{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;\n\n        float attenuation{{LIGHT_INDEX}} = CalculateFalloff(\n            phongLightDistance{{LIGHT_INDEX}},\n            phongLightDirection{{LIGHT_INDEX}},\n            phongLight{{LIGHT_INDEX}}.lightProperties.FALLOFF,\n            phongLight{{LIGHT_INDEX}}.lightProperties.RADIUS\n        );\n\n        attenuation{{LIGHT_INDEX}} *= when_gt(phongLambert{{LIGHT_INDEX}}, 0.);\n\n        combinedColor{{LIGHT_INDEX}} *= attenuation{{LIGHT_INDEX}};\n\n        combinedColor{{LIGHT_INDEX}} *= phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY;\n        calculatedColor += combinedColor{{LIGHT_INDEX}};\n    }","snippet_head_frag":"UNI Light phongLight{{LIGHT_INDEX}};\n",};
const cgl = op.patch.cgl;

const attachmentFragmentHead = attachments.snippet_head_frag;
const snippets = {
    "point": attachments.snippet_body_point_frag,
    "spot": attachments.snippet_body_spot_frag,
    "ambient": attachments.snippet_body_ambient_frag,
    "directional": attachments.snippet_body_directional_frag,
    "area": attachments.snippet_body_area_frag,
};
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");

const createFragmentHead = (n) => { return attachmentFragmentHead.replace("{{LIGHT_INDEX}}", n); };
const createFragmentBody = (n, type) => { return snippets[type].replace(LIGHT_INDEX_REGEX, n); };

function createDefaultShader()
{
    const vertexShader = attachments.phong_vert;
    let fragmentShader = attachments.phong_frag;

    let fragmentHead = createFragmentHead(0);
    let fragmentBody = createFragmentBody(0, DEFAULT_LIGHTSTACK[0].type);

    fragmentShader = fragmentShader.replace(FRAGMENT_HEAD_REGEX, fragmentHead);
    fragmentShader = fragmentShader.replace(FRAGMENT_BODY_REGEX, fragmentBody);

    shader.setSource(vertexShader, fragmentShader);
    shader.define("HAS_POINT");
    shader.removeDefine("HAS_SPOT");
    shader.removeDefine("HAS_DIRECTIONAL");
    shader.removeDefine("HAS_AMBIENT");
}

const inTrigger = op.inTrigger("Trigger In");

// * DIFFUSE *
const inDiffuseR = op.inFloat("R", Math.random());
const inDiffuseG = op.inFloat("G", Math.random());
const inDiffuseB = op.inFloat("B", Math.random());
const inDiffuseA = op.inFloatSlider("A", 1);
const diffuseColors = [inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA];
op.setPortGroup("Diffuse Color", diffuseColors);

const inToggleOrenNayar = op.inBool("Enable", false);
const inAlbedo = op.inFloatSlider("Albedo", 0.707);
const inRoughness = op.inFloatSlider("Roughness", 0.835);

inToggleOrenNayar.setUiAttribs({ "hidePort": true });
inAlbedo.setUiAttribs({ "greyout": true });
inRoughness.setUiAttribs({ "greyout": true });
inDiffuseR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Oren-Nayar Diffuse", [inToggleOrenNayar, inAlbedo, inRoughness]);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

inToggleOrenNayar.onChange = function ()
{
    shader.toggleDefine("ENABLE_OREN_NAYAR_DIFFUSE", inToggleOrenNayar);
    inAlbedo.setUiAttribs({ "greyout": !inToggleOrenNayar.get() });
    inRoughness.setUiAttribs({ "greyout": !inToggleOrenNayar.get() });
};

// * FRESNEL *
const inToggleFresnel = op.inValueBool("Active", false);
inToggleFresnel.setUiAttribs({ "hidePort": true });
const inFresnel = op.inValueSlider("Fresnel Intensity", 0.7);
const inFresnelWidth = op.inFloat("Fresnel Width", 1);
const inFresnelExponent = op.inFloat("Fresnel Exponent", 6);
const inFresnelR = op.inFloat("Fresnel R", 1);
const inFresnelG = op.inFloat("Fresnel G", 1);
const inFresnelB = op.inFloat("Fresnel B", 1);
inFresnelR.setUiAttribs({ "colorPick": true });

const fresnelArr = [inFresnel, inFresnelWidth, inFresnelExponent, inFresnelR, inFresnelG, inFresnelB];
fresnelArr.forEach(function (port) { port.setUiAttribs({ "greyout": true }); });
op.setPortGroup("Fresnel", fresnelArr.concat([inToggleFresnel]));

let uniFresnel = null;
let uniFresnelWidthExponent = null;
inToggleFresnel.onChange = function ()
{
    shader.toggleDefine("ENABLE_FRESNEL", inToggleFresnel);
    if (inToggleFresnel.get())
    {
        if (!uniFresnel) uniFresnel = new CGL.Uniform(shader, "4f", "inFresnel", inFresnelR, inFresnelG, inFresnelB, inFresnel);
        if (!uniFresnelWidthExponent) uniFresnelWidthExponent = new CGL.Uniform(shader, "2f", "inFresnelWidthExponent", inFresnelWidth, inFresnelExponent);
    }
    else
    {
        if (uniFresnel)
        {
            shader.removeUniform("inFresnel");
            uniFresnel = null;
        }

        if (uniFresnelWidthExponent)
        {
            shader.removeUniform("inFresnelWidthExponent");
            uniFresnelWidthExponent = null;
        }
    }

    fresnelArr.forEach(function (port) { port.setUiAttribs({ "greyout": !inToggleFresnel.get() }); });
};
// * EMISSIVE *
const inEmissiveActive = op.inBool("Emissive Active", false);
const inEmissiveColorIntensity = op.inFloatSlider("Color Intensity", 0.3);
const inEmissiveR = op.inFloatSlider("Emissive R", Math.random());
const inEmissiveG = op.inFloatSlider("Emissive G", Math.random());
const inEmissiveB = op.inFloatSlider("Emissive B", Math.random());
inEmissiveR.setUiAttribs({ "colorPick": true });
op.setPortGroup("Emissive Color", [inEmissiveActive, inEmissiveColorIntensity, inEmissiveR, inEmissiveG, inEmissiveB]);

inEmissiveColorIntensity.setUiAttribs({ "greyout": !inEmissiveActive.get() });
inEmissiveR.setUiAttribs({ "greyout": !inEmissiveActive.get() });
inEmissiveG.setUiAttribs({ "greyout": !inEmissiveActive.get() });
inEmissiveB.setUiAttribs({ "greyout": !inEmissiveActive.get() });

let uniEmissiveColor = null;

inEmissiveActive.onChange = () =>
{
    shader.toggleDefine("ADD_EMISSIVE_COLOR", inEmissiveActive);

    if (inEmissiveActive.get())
    {
        uniEmissiveColor = new CGL.Uniform(shader, "4f", "inEmissiveColor", inEmissiveR, inEmissiveG, inEmissiveB, inEmissiveColorIntensity);
        inEmissiveTexture.setUiAttribs({ "greyout": false });
        inEmissiveMaskTexture.setUiAttribs({ "greyout": false });

        if (inEmissiveTexture.get()) inEmissiveIntensity.setUiAttribs({ "greyout": false });
        if (inEmissiveMaskTexture.get()) inEmissiveMaskIntensity.setUiAttribs({ "greyout": false });
    }
    else
    {
        op.log("ayayay");
        inEmissiveTexture.setUiAttribs({ "greyout": true });
        inEmissiveMaskTexture.setUiAttribs({ "greyout": true });
        inEmissiveIntensity.setUiAttribs({ "greyout": true });
        inEmissiveMaskIntensity.setUiAttribs({ "greyout": true });

        shader.removeUniform("inEmissiveColor");
        uniEmissiveColor = null;
    }

    if (inEmissiveTexture.get())
    {
        inEmissiveColorIntensity.setUiAttribs({ "greyout": true });
        inEmissiveR.setUiAttribs({ "greyout": true });
        inEmissiveG.setUiAttribs({ "greyout": true });
        inEmissiveB.setUiAttribs({ "greyout": true });
    }
    else
    {
        if (inEmissiveActive.get())
        {
            inEmissiveColorIntensity.setUiAttribs({ "greyout": false });
            inEmissiveR.setUiAttribs({ "greyout": false });
            inEmissiveG.setUiAttribs({ "greyout": false });
            inEmissiveB.setUiAttribs({ "greyout": false });
        }
        else
        {
            inEmissiveColorIntensity.setUiAttribs({ "greyout": true });
            inEmissiveR.setUiAttribs({ "greyout": true });
            inEmissiveG.setUiAttribs({ "greyout": true });
            inEmissiveB.setUiAttribs({ "greyout": true });
        }
    }
};
// * SPECULAR *
const inShininess = op.inFloat("Shininess", 4);
const inSpecularCoefficient = op.inFloatSlider("Specular Amount", 0.5);
const inSpecularMode = op.inSwitch("Specular Model", ["Blinn", "Schlick", "Phong", "Gauss"], "Blinn");

inSpecularMode.setUiAttribs({ "hidePort": true });
const specularColors = [inShininess, inSpecularCoefficient, inSpecularMode];
op.setPortGroup("Specular", specularColors);

// * LIGHT *
const inEnergyConservation = op.inValueBool("Energy Conservation", false);
const inToggleDoubleSided = op.inBool("Double Sided Material", false);
const inFalloffMode = op.inSwitch("Falloff Mode", ["A", "B", "C", "D"], "A");
inEnergyConservation.setUiAttribs({ "hidePort": true });
inToggleDoubleSided.setUiAttribs({ "hidePort": true });
inFalloffMode.setUiAttribs({ "hidePort": true });
inFalloffMode.onChange = () =>
{
    const MODES = ["A", "B", "C", "D"];
    shader.define("FALLOFF_MODE_" + inFalloffMode.get());
    MODES.filter((mode) => { return mode !== inFalloffMode.get(); })
        .forEach((mode) => { return shader.removeDefine("FALLOFF_MODE_" + mode); });
};

const lightProps = [inEnergyConservation, inToggleDoubleSided, inFalloffMode];
op.setPortGroup("Light Options", lightProps);

// TEXTURES
const inDiffuseTexture = op.inTexture("Diffuse Texture");
const inSpecularTexture = op.inTexture("Specular Texture");
const inNormalTexture = op.inTexture("Normal Map");
const inAoTexture = op.inTexture("AO Texture");
const inEmissiveTexture = op.inTexture("Emissive Texture");
const inEmissiveMaskTexture = op.inTexture("Emissive Mask");
const inAlphaTexture = op.inTexture("Opacity Texture");
const inEnvTexture = op.inTexture("Environment Map");
const inLuminanceMaskTexture = op.inTexture("Env Map Mask");
op.setPortGroup("Textures", [inDiffuseTexture, inSpecularTexture, inNormalTexture, inAoTexture, inEmissiveTexture, inEmissiveMaskTexture, inAlphaTexture, inEnvTexture, inLuminanceMaskTexture]);

// TEXTURE TRANSFORMS
const inColorizeTexture = op.inBool("Colorize Texture", false);
const inDiffuseRepeatX = op.inFloat("Diffuse Repeat X", 1);
const inDiffuseRepeatY = op.inFloat("Diffuse Repeat Y", 1);
const inTextureOffsetX = op.inFloat("Texture Offset X", 0);
const inTextureOffsetY = op.inFloat("Texture Offset Y", 0);

const inSpecularIntensity = op.inFloatSlider("Specular Intensity", 1);
const inNormalIntensity = op.inFloatSlider("Normal Map Intensity", 0.5);
const inAoIntensity = op.inFloatSlider("AO Intensity", 1);
const inAoChannel = op.inSwitch("AO UV Channel", ["1", "2"], 1);
const inEmissiveIntensity = op.inFloatSlider("Emissive Intensity", 1);
const inEmissiveMaskIntensity = op.inFloatSlider("Emissive Mask Intensity", 1);
const inEnvMapIntensity = op.inFloatSlider("Env Map Intensity", 1);
const inEnvMapBlend = op.inSwitch("Env Map Blend", ["Add", "Multiply", "Mix"], "Add");
const inLuminanceMaskIntensity = op.inFloatSlider("Env Mask Intensity", 1);

inColorizeTexture.setUiAttribs({ "hidePort": true });
op.setPortGroup("Texture Transforms", [inColorizeTexture, inDiffuseRepeatY, inDiffuseRepeatX, inTextureOffsetY, inTextureOffsetX]);
op.setPortGroup("Texture Intensities", [inNormalIntensity, inAoIntensity, inSpecularIntensity, inEmissiveIntensity, inEnvMapBlend, inEmissiveMaskIntensity, inEnvMapIntensity, inLuminanceMaskIntensity]);
const alphaMaskSource = op.inSwitch("Alpha Mask Source", ["Luminance", "R", "G", "B", "A"], "Luminance");
alphaMaskSource.setUiAttribs({ "greyout": true });

const discardTransPxl = op.inValueBool("Discard Transparent Pixels");
discardTransPxl.setUiAttribs({ "hidePort": true });

op.setPortGroup("Opacity Texture", [alphaMaskSource, discardTransPxl]);

inAoChannel.onChange =
    inEnvMapBlend.onChange =
    alphaMaskSource.onChange = updateDefines;

const outTrigger = op.outTrigger("Trigger Out");
const shaderOut = op.outObject("Shader", null, "shader");
shaderOut.ignoreValueSerialize = true;

const shader = new CGL.Shader(cgl, "phongmaterial_" + op.id, this);
shader.op = this;
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_BASE_COLOR", "MODULE_VERTEX_MODELVIEW"]);
shader.setSource(attachments.simosphong_vert, attachments.simosphong_frag);
// let recompileShader = false;
shader.define("FALLOFF_MODE_A");

if (cgl.glVersion < 2)
{
    shader.enableExtension("GL_OES_standard_derivatives");

    if (cgl.enableExtension("OES_texture_float")) shader.enableExtension("GL_OES_texture_float");
    else op.log("error loading extension OES_texture_float");

    if (cgl.enableExtension("OES_texture_float_linear")) shader.enableExtension("GL_OES_texture_float_linear");
    else op.log("error loading extention OES_texture_float_linear");

    if (cgl.enableExtension("GL_OES_texture_half_float")) shader.enableExtension("GL_OES_texture_half_float");
    else op.log("error loading extention GL_OES_texture_half_float");

    if (cgl.enableExtension("GL_OES_texture_half_float_linear")) shader.enableExtension("GL_OES_texture_half_float_linear");
    else op.log("error loading extention GL_OES_texture_half_float_linear");
}

const FRAGMENT_HEAD_REGEX = new RegExp("{{PHONG_FRAGMENT_HEAD}}", "g");
const FRAGMENT_BODY_REGEX = new RegExp("{{PHONG_FRAGMENT_BODY}}", "g");

const hasLight = {
    "directional": false,
    "spot": false,
    "ambient": false,
    "point": false,
};

function createShader(lightStack)
{
    let fragmentShader = attachments.phong_frag;

    let fragmentHead = "";
    let fragmentBody = "";

    hasLight.directional = false;
    hasLight.spot = false;
    hasLight.ambient = false;
    hasLight.point = false;

    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];

        const type = light.type;

        if (!hasLight[type])
        {
            hasLight[type] = true;
        }

        fragmentHead = fragmentHead.concat(createFragmentHead(i));
        fragmentBody = fragmentBody.concat(createFragmentBody(i, light.type));
    }

    fragmentShader = fragmentShader.replace(FRAGMENT_HEAD_REGEX, fragmentHead);
    fragmentShader = fragmentShader.replace(FRAGMENT_BODY_REGEX, fragmentBody);

    shader.setSource(attachments.phong_vert, fragmentShader);

    for (let i = 0, keys = Object.keys(hasLight); i < keys.length; i += 1)
    {
        const key = keys[i];

        if (hasLight[key])
        {
            if (!shader.hasDefine("HAS_" + key.toUpperCase()))
            {
                shader.define("HAS_" + key.toUpperCase());
            }
        }
        else
        {
            if (shader.hasDefine("HAS_" + key.toUpperCase()))
            {
                shader.removeDefine("HAS_" + key.toUpperCase());
            }
        }
    }
}

shaderOut.setRef(shader);

let diffuseTextureUniform = null;
let specularTextureUniform = null;
let normalTextureUniform = null;
let aoTextureUniform = null;
let emissiveTextureUniform = null;
let emissiveMaskTextureUniform = null;
let emissiveMaskIntensityUniform = null;
let alphaTextureUniform = null;
let envTextureUniform = null;
let inEnvMapIntensityUni = null;
let inEnvMapWidthUni = null;
let luminanceTextureUniform = null;
let inLuminanceMaskIntensityUniform = null;

inColorizeTexture.onChange = function ()
{
    shader.toggleDefine("COLORIZE_TEXTURE", inColorizeTexture.get());
};

function updateDiffuseTexture()
{
    if (inDiffuseTexture.get())
    {
        if (!shader.hasDefine("HAS_TEXTURE_DIFFUSE"))
        {
            shader.define("HAS_TEXTURE_DIFFUSE");
            if (!diffuseTextureUniform) diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse", 0);
        }
    }
    else
    {
        shader.removeUniform("texDiffuse");
        shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = null;
    }
}

function updateSpecularTexture()
{
    if (inSpecularTexture.get())
    {
        inSpecularIntensity.setUiAttribs({ "greyout": false });
        if (!shader.hasDefine("HAS_TEXTURE_SPECULAR"))
        {
            shader.define("HAS_TEXTURE_SPECULAR");
            if (!specularTextureUniform) specularTextureUniform = new CGL.Uniform(shader, "t", "texSpecular", 0);
        }
    }
    else
    {
        inSpecularIntensity.setUiAttribs({ "greyout": true });
        shader.removeUniform("texSpecular");
        shader.removeDefine("HAS_TEXTURE_SPECULAR");
        specularTextureUniform = null;
    }
}

function updateNormalTexture()
{
    if (inNormalTexture.get())
    {
        inNormalIntensity.setUiAttribs({ "greyout": false });

        if (!shader.hasDefine("HAS_TEXTURE_NORMAL"))
        {
            shader.define("HAS_TEXTURE_NORMAL");
            if (!normalTextureUniform) normalTextureUniform = new CGL.Uniform(shader, "t", "texNormal", 0);
        }
    }
    else
    {
        inNormalIntensity.setUiAttribs({ "greyout": true });

        shader.removeUniform("texNormal");
        shader.removeDefine("HAS_TEXTURE_NORMAL");
        normalTextureUniform = null;
    }
}

aoTextureUniform = new CGL.Uniform(shader, "t", "texAO");

function updateAoTexture()
{
    shader.toggleDefine("HAS_TEXTURE_AO", inAoTexture.get());

    inAoIntensity.setUiAttribs({ "greyout": !inAoTexture.get() });

    // if (inAoTexture.get())
    // {
    //     // inAoIntensity.setUiAttribs({ "greyout": false });

    //     // if (!shader.hasDefine("HAS_TEXTURE_AO"))
    //     // {
    //         // shader.define("HAS_TEXTURE_AO");
    //         // if (!aoTextureUniform)
    //         aoTextureUniform = new CGL.Uniform(shader, "t", "texAO", 0);
    //     // }
    // }
    // else
    // {
    //     // inAoIntensity.setUiAttribs({ "greyout": true });

    //     shader.removeUniform("texAO");
    //     // shader.removeDefine("HAS_TEXTURE_AO");
    //     aoTextureUniform = null;
    // }
}

function updateEmissiveTexture()
{
    if (inEmissiveTexture.get())
    {
        inEmissiveR.setUiAttribs({ "greyout": true });
        inEmissiveG.setUiAttribs({ "greyout": true });
        inEmissiveB.setUiAttribs({ "greyout": true });
        inEmissiveColorIntensity.setUiAttribs({ "greyout": true });

        if (inEmissiveActive.get())
        {
            inEmissiveIntensity.setUiAttribs({ "greyout": false });
        }

        if (!shader.hasDefine("HAS_TEXTURE_EMISSIVE"))
        {
            shader.define("HAS_TEXTURE_EMISSIVE");
            if (!emissiveTextureUniform) emissiveTextureUniform = new CGL.Uniform(shader, "t", "texEmissive", 0);
        }
    }
    else
    {
        inEmissiveIntensity.setUiAttribs({ "greyout": true });

        if (inEmissiveActive.get())
        {
            inEmissiveR.setUiAttribs({ "greyout": false });
            inEmissiveG.setUiAttribs({ "greyout": false });
            inEmissiveB.setUiAttribs({ "greyout": false });
            inEmissiveColorIntensity.setUiAttribs({ "greyout": false });
        }
        else
        {
            inEmissiveTexture.setUiAttribs({ "greyout": true });
        }

        shader.removeUniform("texEmissive");
        shader.removeDefine("HAS_TEXTURE_EMISSIVE");
        emissiveTextureUniform = null;
    }
}

function updateEmissiveMaskTexture()
{
    if (inEmissiveMaskTexture.get())
    { // we have a emissive texture
        if (inEmissiveActive.get())
        {
            inEmissiveMaskIntensity.setUiAttribs({ "greyout": false });
        }

        if (!shader.hasDefine("HAS_TEXTURE_EMISSIVE_MASK"))
        {
            shader.define("HAS_TEXTURE_EMISSIVE_MASK");
            if (!emissiveMaskTextureUniform) emissiveMaskTextureUniform = new CGL.Uniform(shader, "t", "texMaskEmissive", 0);
            if (!emissiveMaskIntensityUniform) emissiveMaskIntensityUniform = new CGL.Uniform(shader, "f", "inEmissiveMaskIntensity", inEmissiveMaskIntensity);
        }
    }
    else
    {
        if (!inEmissiveActive.get())
        {
            inEmissiveMaskTexture.setUiAttribs({ "greyout": true });
        }
        inEmissiveMaskIntensity.setUiAttribs({ "greyout": true });
        shader.removeUniform("texMaskEmissive");
        shader.removeUniform("inEmissiveMaskIntensity");
        shader.removeDefine("HAS_TEXTURE_EMISSIVE_MASK");
        emissiveMaskTextureUniform = null;
        emissiveMaskIntensityUniform = null;
    }
}

let updateEnvTextureLater = false;
function updateEnvTexture()
{
    shader.toggleDefine("HAS_TEXTURE_ENV", inEnvTexture.get());

    inEnvMapIntensity.setUiAttribs({ "greyout": !inEnvTexture.get() });

    if (inEnvTexture.get())
    {
        if (!envTextureUniform) envTextureUniform = new CGL.Uniform(shader, "t", "texEnv", 0);

        shader.toggleDefine("TEX_FORMAT_CUBEMAP", inEnvTexture.get().cubemap);

        if (inEnvTexture.get().cubemap)
        {
            shader.removeDefine("TEX_FORMAT_EQUIRECT");
            shader.removeDefine("ENVMAP_MATCAP");
            if (!inEnvMapIntensityUni)inEnvMapIntensityUni = new CGL.Uniform(shader, "f", "inEnvMapIntensity", inEnvMapIntensity);
            if (!inEnvMapWidthUni)inEnvMapWidthUni = new CGL.Uniform(shader, "f", "inEnvMapWidth", inEnvTexture.get().cubemap.width);
        }
        else
        {
            const isSquare = inEnvTexture.get().width === inEnvTexture.get().height;
            shader.toggleDefine("TEX_FORMAT_EQUIRECT", !isSquare);
            shader.toggleDefine("ENVMAP_MATCAP", isSquare);

            if (!inEnvMapIntensityUni)inEnvMapIntensityUni = new CGL.Uniform(shader, "f", "inEnvMapIntensity", inEnvMapIntensity);
            if (!inEnvMapWidthUni) inEnvMapWidthUni = new CGL.Uniform(shader, "f", "inEnvMapWidth", inEnvTexture.get().width);
        }
    }
    else
    {
        shader.removeUniform("inEnvMapIntensity");
        shader.removeUniform("inEnvMapWidth");
        shader.removeUniform("texEnv");
        shader.removeDefine("HAS_TEXTURE_ENV");
        shader.removeDefine("ENVMAP_MATCAP");
        envTextureUniform = null;
        inEnvMapIntensityUni = null;
    }

    updateEnvTextureLater = false;
}

function updateLuminanceMaskTexture()
{
    if (inLuminanceMaskTexture.get())
    {
        inLuminanceMaskIntensity.setUiAttribs({ "greyout": false });
        if (!luminanceTextureUniform)
        {
            shader.define("HAS_TEXTURE_LUMINANCE_MASK");
            luminanceTextureUniform = new CGL.Uniform(shader, "t", "texLuminance", 0);
            inLuminanceMaskIntensityUniform = new CGL.Uniform(shader, "f", "inLuminanceMaskIntensity", inLuminanceMaskIntensity);
        }
    }
    else
    {
        inLuminanceMaskIntensity.setUiAttribs({ "greyout": true });
        shader.removeDefine("HAS_TEXTURE_LUMINANCE_MASK");
        shader.removeUniform("inLuminanceMaskIntensity");
        shader.removeUniform("texLuminance");
        luminanceTextureUniform = null;
        inLuminanceMaskIntensityUniform = null;
    }
}

// TEX OPACITY

function updateDefines()
{
    shader.toggleDefine("ENV_BLEND_ADD", inEnvMapBlend.get() == "Add");
    shader.toggleDefine("ENV_BLEND_MUL", inEnvMapBlend.get() == "Multiply");
    shader.toggleDefine("ENV_BLEND_MIX", inEnvMapBlend.get() == "Mix");

    shader.toggleDefine("ALPHA_MASK_ALPHA", alphaMaskSource.get() == "A" || alphaMaskSource.get() == "Alpha");
    shader.toggleDefine("ALPHA_MASK_LUMI", alphaMaskSource.get() == "Luminance");
    shader.toggleDefine("ALPHA_MASK_R", alphaMaskSource.get() == "R");
    shader.toggleDefine("ALPHA_MASK_G", alphaMaskSource.get() == "G");
    shader.toggleDefine("ALPHA_MASK_B", alphaMaskSource.get() == "B");

    shader.toggleDefine("AO_CHAN_0", inAoChannel.get() == "1");
    shader.toggleDefine("AO_CHAN_1", inAoChannel.get() == "2");
}

function updateAlphaTexture()
{
    if (inAlphaTexture.get())
    {
        if (alphaTextureUniform !== null) return;
        shader.removeUniform("texAlpha");
        shader.define("HAS_TEXTURE_ALPHA");
        if (!alphaTextureUniform) alphaTextureUniform = new CGL.Uniform(shader, "t", "texAlpha", 0);

        alphaMaskSource.setUiAttribs({ "greyout": false });
        discardTransPxl.setUiAttribs({ "greyout": false });
    }
    else
    {
        shader.removeUniform("texAlpha");
        shader.removeDefine("HAS_TEXTURE_ALPHA");
        alphaTextureUniform = null;

        alphaMaskSource.setUiAttribs({ "greyout": true });
        discardTransPxl.setUiAttribs({ "greyout": true });
    }
    updateDefines();
}

discardTransPxl.onChange = function ()
{
    shader.toggleDefine("DISCARDTRANS", discardTransPxl.get());
};

inDiffuseTexture.onChange = updateDiffuseTexture;
inSpecularTexture.onChange = updateSpecularTexture;
inNormalTexture.onChange = updateNormalTexture;
inAoTexture.onChange = updateAoTexture;
inEmissiveTexture.onChange = updateEmissiveTexture;
inEmissiveMaskTexture.onChange = updateEmissiveMaskTexture;
inAlphaTexture.onChange = updateAlphaTexture;
inEnvTexture.onChange = () => { updateEnvTextureLater = true; };
inLuminanceMaskTexture.onChange = updateLuminanceMaskTexture;

const MAX_UNIFORM_FRAGMENTS = cgl.maxUniformsFrag;
const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 6 : 16;

shader.define("MAX_LIGHTS", MAX_LIGHTS.toString());
shader.define("SPECULAR_PHONG");

inSpecularMode.onChange = function ()
{
    if (inSpecularMode.get() === "Phong")
    {
        shader.define("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_SCHLICK");
    }
    else if (inSpecularMode.get() === "Blinn")
    {
        shader.define("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_SCHLICK");
    }
    else if (inSpecularMode.get() === "Gauss")
    {
        shader.define("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_SCHLICK");
    }
    else if (inSpecularMode.get() === "Schlick")
    {
        shader.define("SPECULAR_SCHLICK");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_GAUSS");
    }
};

inEnergyConservation.onChange = function ()
{
    shader.toggleDefine("CONSERVE_ENERGY", inEnergyConservation.get());
};

inToggleDoubleSided.onChange = function ()
{
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};

// * INIT UNIFORMS *

const uniMaterialProps = new CGL.Uniform(shader, "4f", "inMaterialProperties", inAlbedo, inRoughness, inShininess, inSpecularCoefficient);
const uniDiffuseColor = new CGL.Uniform(shader, "4f", "inDiffuseColor", inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA);
const uniTextureIntensities = new CGL.Uniform(shader, "4f", "inTextureIntensities", inNormalIntensity, inAoIntensity, inSpecularIntensity, inEmissiveIntensity);
const uniTextureRepeatOffset = new CGL.Uniform(shader, "4f", "inTextureRepeatOffset", inDiffuseRepeatX, inDiffuseRepeatY, inTextureOffsetX, inTextureOffsetY);

shader.uniformColorDiffuse = uniDiffuseColor; // todo remove in next version

const lightUniforms = [];
let oldCount = 0;

function createUniforms(lightsCount)
{
    for (let i = 0; i < lightUniforms.length; i += 1)
    {
        lightUniforms[i] = null;
    }

    for (let i = 0; i < lightsCount; i += 1)
    {
        lightUniforms[i] = null;
        if (!lightUniforms[i])
        {
            lightUniforms[i] = {
                "color": new CGL.Uniform(shader, "3f", "phongLight" + i + ".color", [1, 1, 1]),
                "position": new CGL.Uniform(shader, "3f", "phongLight" + i + ".position", [0, 11, 0]),
                "specular": new CGL.Uniform(shader, "3f", "phongLight" + i + ".specular", [1, 1, 1]),
                // intensity, attenuation, falloff, radius
                "lightProperties": new CGL.Uniform(shader, "4f", "phongLight" + i + ".lightProperties", [1, 1, 1, 1]),

                "conePointAt": new CGL.Uniform(shader, "3f", "phongLight" + i + ".conePointAt", vec3.create()),
                "spotProperties": new CGL.Uniform(shader, "3f", "phongLight" + i + ".spotProperties", [0, 0, 0, 0]),
                "castLight": new CGL.Uniform(shader, "i", "phongLight" + i + ".castLight", 1),

            };
        }
    }
}

function setDefaultUniform(light)
{
    defaultUniform.position.setValue(light.position);
    defaultUniform.color.setValue(light.color);
    defaultUniform.specular.setValue(light.specular);
    defaultUniform.lightProperties.setValue([
        light.intensity,
        light.attenuation,
        light.falloff,
        light.radius,
    ]);

    defaultUniform.conePointAt.setValue(light.conePointAt);
    defaultUniform.spotProperties.setValue([
        light.cosConeAngle,
        light.cosConeAngleInner,
        light.spotExponent,
    ]);
}

function setUniforms(lightStack)
{
    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];
        light.isUsed = true;

        lightUniforms[i].position.setValue(light.position);
        lightUniforms[i].color.setValue(light.color);
        lightUniforms[i].specular.setValue(light.specular);

        lightUniforms[i].lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);

        lightUniforms[i].conePointAt.setValue(light.conePointAt);
        lightUniforms[i].spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);

        lightUniforms[i].castLight.setValue(light.castLight);
    }
}

function compareLights(lightStack)
{
    if (lightStack.length !== oldCount)
    {
        createShader(lightStack);
        createUniforms(lightStack.length);
        oldCount = lightStack.length;
        setUniforms(lightStack);
        // recompileShader = false;
    }
    else
    {
        // if (recompileShader)
        // {
        //     createShader(lightStack);
        //     createUniforms(lightStack.length);
        //     recompileShader = false;
        // }
        setUniforms(lightStack);
    }
}

let defaultUniform = null;

function createDefaultUniform()
{
    defaultUniform = {
        "color": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".color", [1, 1, 1]),
        "specular": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".specular", [1, 1, 1]),
        "position": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".position", [0, 11, 0]),
        // intensity, attenuation, falloff, radius
        "lightProperties": new CGL.Uniform(shader, "4f", "phongLight" + 0 + ".lightProperties", [1, 1, 1, 1]),
        "conePointAt": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".conePointAt", vec3.create()),
        "spotProperties": new CGL.Uniform(shader, "3f", "phongLight" + 0 + ".spotProperties", [0, 0, 0, 0]),
        "castLight": new CGL.Uniform(shader, "i", "phongLight" + 0 + ".castLight", 1),
    };
}

const DEFAULT_LIGHTSTACK = [{
    "type": "point",
    "position": [5, 5, 5],
    "color": [1, 1, 1],
    "specular": [1, 1, 1],
    "intensity": 1,
    "attenuation": 0,
    "falloff": 0.5,
    "radius": 80,
    "castLight": 1,
}];

const iViewMatrix = mat4.create();

function updateLights()
{
    if (cgl.tempData.lightStack)
    {
        if (cgl.tempData.lightStack.length === 0)
        {
            op.setUiError("deflight", "Default light is enabled. Please add lights to your patch to make this warning disappear.", 1);
        }
        else op.setUiError("deflight", null);
    }

    if ((!cgl.tempData.lightStack || !cgl.tempData.lightStack.length))
    {
        // if no light in light stack, use default light & set count to -1
        // so when a new light gets added, the shader does recompile
        if (!defaultUniform)
        {
            createDefaultShader();
            createDefaultUniform();
        }

        mat4.invert(iViewMatrix, cgl.vMatrix);
        // set default light position to camera position
        DEFAULT_LIGHTSTACK[0].position = [iViewMatrix[12], iViewMatrix[13], iViewMatrix[14]];
        setDefaultUniform(DEFAULT_LIGHTSTACK[0]);

        oldCount = -1;
    }
    else
    {
        if (shader)
        {
            if (cgl.tempData.lightStack)
            {
                if (cgl.tempData.lightStack.length)
                {
                    defaultUniform = null;
                    compareLights(cgl.tempData.lightStack);
                }
            }
        }
    }
}

const render = function ()
{
    if (!shader)
    {
        op.log("NO SHADER");
        return;
    }

    cgl.pushShader(shader);
    shader.popTextures();

    outTrigger.trigger();
    cgl.popShader();
};

op.preRender = function ()
{
    shader.bind();
    render();
};

/* transform for default light */
const inverseViewMat = mat4.create();
const vecTemp = vec3.create();
const camPos = vec3.create();

inTrigger.onTriggered = function ()
{
    if (!shader)
    {
        op.log("phong has no shader...");
        return;
    }

    if (updateEnvTextureLater)updateEnvTexture();

    cgl.pushShader(shader);

    shader.popTextures();

    if (inDiffuseTexture.get()) shader.pushTexture(diffuseTextureUniform, inDiffuseTexture.get());
    if (inSpecularTexture.get()) shader.pushTexture(specularTextureUniform, inSpecularTexture.get());
    if (inNormalTexture.get()) shader.pushTexture(normalTextureUniform, inNormalTexture.get());
    if (inAoTexture.get()) shader.pushTexture(aoTextureUniform, inAoTexture.get());
    if (inEmissiveTexture.get()) shader.pushTexture(emissiveTextureUniform, inEmissiveTexture.get());
    if (inEmissiveMaskTexture.get()) shader.pushTexture(emissiveMaskTextureUniform, inEmissiveMaskTexture.get());
    if (inAlphaTexture.get()) shader.pushTexture(alphaTextureUniform, inAlphaTexture.get());
    if (inEnvTexture.get())
    {
        if (inEnvTexture.get().cubemap) shader.pushTexture(envTextureUniform, inEnvTexture.get().cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        else shader.pushTexture(envTextureUniform, inEnvTexture.get());
    }

    if (inLuminanceMaskTexture.get())
    {
        shader.pushTexture(luminanceTextureUniform, inLuminanceMaskTexture.get());
    }

    updateLights();

    outTrigger.trigger();

    cgl.popShader();
};

if (cgl.glVersion == 1)
{
    if (!cgl.enableExtension("EXT_shader_texture_lod"))
    {
        op.log("no EXT_shader_texture_lod texture extension");
        // throw "no EXT_shader_texture_lod texture extension";
    }
    else
    {
        shader.enableExtension("GL_EXT_shader_texture_lod");
        cgl.enableExtension("OES_texture_float");
        cgl.enableExtension("OES_texture_float_linear");
        cgl.enableExtension("OES_texture_half_float");
        cgl.enableExtension("OES_texture_half_float_linear");

        shader.enableExtension("GL_OES_standard_derivatives");
        shader.enableExtension("GL_OES_texture_float");
        shader.enableExtension("GL_OES_texture_float_linear");
        shader.enableExtension("GL_OES_texture_half_float");
        shader.enableExtension("GL_OES_texture_half_float_linear");
    }
}

shader.materialPropUniforms = {
    "diffuseTexture": diffuseTextureUniform,
    // "normalTexture": inNormalUniform,
    "diffuseColor": uniDiffuseColor,
    "occlusionTexture": aoTextureUniform,

    // "pbrMetalness": inMetalnessUniform,
    // "pbrRoughness": inRoughnessUniform,
};

updateDiffuseTexture();
updateSpecularTexture();
updateNormalTexture();
updateAoTexture();
updateAlphaTexture();
updateEmissiveTexture();
updateEmissiveMaskTexture();
updateEnvTexture();
updateLuminanceMaskTexture();

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Vignette_v3
// 
// **************************************************************

Ops.Gl.ImageCompose.Vignette_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"vignette_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float lensRadius1;\nUNI float aspect;\nUNI float amount;\nUNI float strength;\nUNI float sharp;\n\nUNI vec3 vcol;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec4 base=texture(tex,texCoord);\n    vec4 vvcol=vec4(vcol,1.0);\n    vec4 col=texture(tex,texCoord);\n    vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*aspect+0.5);\n    float dist = distance(tcPos, vec2(0.5,0.5));\n    float am = (1.0-smoothstep( (lensRadius1+0.5), (lensRadius1*0.99+0.5)*sharp, dist));\n\n    col=mix(col,vvcol,am*strength);\n\n    #ifndef ALPHA\n        outColor=cgl_blendPixel(base,col,amount);\n    #endif\n\n    #ifdef ALPHA\n        outColor=vec4(base.rgb,base.a*(1.0-am*strength));\n    #endif\n}\n",};
const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    trigger = op.outTrigger("Trigger"),
    strength = op.inValueSlider("Strength", 1),
    lensRadius1 = op.inValueSlider("Radius", 0.3),
    sharp = op.inValueSlider("Sharp", 0.25),
    aspect = op.inValue("Aspect", 1),
    r = op.inValueSlider("r", 0),
    g = op.inValueSlider("g", 0),
    b = op.inValueSlider("b", 0),
    alpha = op.inBool("Alpha", false);

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "vignette");

shader.setSource(shader.getDefaultVertexShader(), attachments.vignette_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniLensRadius1 = new CGL.Uniform(shader, "f", "lensRadius1", lensRadius1),
    uniaspect = new CGL.Uniform(shader, "f", "aspect", aspect),
    unistrength = new CGL.Uniform(shader, "f", "strength", strength),
    unisharp = new CGL.Uniform(shader, "f", "sharp", sharp),
    unir = new CGL.Uniform(shader, "3f", "vcol", r, g, b);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

alpha.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("ALPHA", alpha.get());

    r.setUiAttribs({ "greyout": alpha.get() });
    g.setUiAttribs({ "greyout": alpha.get() });
    b.setUiAttribs({ "greyout": alpha.get() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.BarrelDistortion_v3
// 
// **************************************************************

Ops.Gl.ImageCompose.BarrelDistortion_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"barreldistort_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\nUNI float intensity;\n\n{{CGL.BLENDMODES3}}\n\n// adapted from https://www.shadertoy.com/view/MlSXR3\n\nvec2 brownConradyDistortion(vec2 uv)\n{\n// positive values of K1 give barrel distortion, negative give pincushion\n    float barrelDistortion1 = intensity*10.; // K1 in text books\n    float barrelDistortion2 = 0.; // K2 in text books\n    float r2 = uv.x*uv.x + uv.y*uv.y;\n    uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;\n\n    // tangential distortion (due to off center lens elements)\n    // is not modeled in this function, but if it was, the terms would go here\n    return uv;\n}\n\nvoid main()\n{\n    vec2 tc=brownConradyDistortion(texCoord-0.5)+0.5;\n    vec4 col=texture(tex,texCoord);\n    vec4 base=texture(tex,tc);\n\n    col.a=0.0;\n    outColor=cgl_blendPixel(col,base,amount);\n}",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1.0),
    intensity = op.inValue("Intensity", 10.0),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.barreldistort_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniintensity = new CGL.Uniform(shader, "f", "intensity", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;
    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    uniintensity.setValue(intensity.get() * (1 / texture.width));

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.ImageCompose_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.ImageCompose_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"imgcomp_frag":"IN vec2 texCoord;\nUNI vec4 bgColor;\nUNI sampler2D tex;\n#ifdef USE_UVTEX\nUNI sampler2D UVTex;\n#endif\n\nvoid main()\n{\n\n    #ifndef USE_TEX\n        outColor=bgColor;\n    #endif\n    #ifdef USE_TEX\n        #ifndef USE_UVTEX\n        outColor=texture(tex,texCoord);\n        #else\n        outColor=texture(tex,texture(UVTex,texCoord).xy);\n        #endif\n    #endif\n\n\n\n}\n",};
const
    cgl = op.patch.cgl,
    render = op.inTrigger("Render"),
    inTex = op.inTexture("Base Texture"),
    inUVTex = op.inTexture("UV Texture"),
    inSize = op.inSwitch("Size", ["Auto", "Canvas", "Manual"], "Auto"),
    width = op.inValueInt("Width", 640),
    height = op.inValueInt("Height", 480),
    inFilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"], "linear"),
    inWrap = op.inValueSelect("Wrap", ["clamp to edge", "repeat", "mirrored repeat"], "repeat"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),

    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),

    inClear = op.inBool("Clear", true),
    r = op.inValueSlider("R", 0),
    g = op.inValueSlider("G", 0),
    b = op.inValueSlider("B", 0),
    a = op.inValueSlider("A", 0),

    trigger = op.outTrigger("Next"),
    texOut = op.outTexture("texture_out", CGL.Texture.getEmptyTexture(cgl)),
    outRatio = op.outNumber("Aspect Ratio"),
    outWidth = op.outNumber("Texture Width"),
    outHeight = op.outNumber("Texture Height");

op.setPortGroup("Texture Size", [inSize, width, height]);
op.setPortGroup("Texture Parameters", [inWrap, aniso, inFilter, inPixelFormat]);

r.setUiAttribs({ "colorPick": true });
op.setPortGroup("Color", [r, g, b, a, inClear]);

op.toWorkPortsNeedToBeLinked(render);

const prevViewPort = [0, 0, 0, 0];
let effect = null;
let tex = null;
let reInitEffect = true;
let isFloatTex = false;
let copyShader = null;
let copyShaderTexUni = null;
let copyShaderUVTexUni = null;
let copyShaderRGBAUni = null;

inWrap.onChange =
inFilter.onChange =
aniso.onChange =
inPixelFormat.onChange = reInitLater;

inTex.onLinkChanged =
inClear.onChange =
    inSize.onChange =
    inUVTex.onChange = updateUi;

render.onTriggered =
    op.preRender = doRender;

updateUi();

function initEffect()
{
    if (effect)effect.delete();
    if (tex)tex.delete();
    tex = null;
    effect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": CGL.Texture.isPixelFormatFloat(inPixelFormat.get()), "name": op.name });

    const cgl_aniso = Math.min(cgl.maxAnisotropic, parseFloat(aniso.get()));

    tex = new CGL.Texture(cgl,
        {
            "anisotropic": cgl_aniso,
            "name": "image_compose_v2_" + op.id,
            "pixelFormat": inPixelFormat.get(),
            "filter": getFilter(),
            "wrap": getWrap(),
            "width": getWidth(),
            "height": getHeight()
        });

    effect.setSourceTexture(tex);

    outWidth.set(getWidth());
    outHeight.set(getHeight());
    outRatio.set(getWidth() / getHeight());

    texOut.setRef(CGL.Texture.getEmptyTexture(cgl));

    reInitEffect = false;
    updateUi();
}

function getFilter()
{
    if (inFilter.get() == "nearest") return CGL.Texture.FILTER_NEAREST;
    else if (inFilter.get() == "linear") return CGL.Texture.FILTER_LINEAR;
    else if (inFilter.get() == "mipmap") return CGL.Texture.FILTER_MIPMAP;
}

function getWrap()
{
    if (inWrap.get() == "repeat") return CGL.Texture.WRAP_REPEAT;
    else if (inWrap.get() == "mirrored repeat") return CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (inWrap.get() == "clamp to edge") return CGL.Texture.WRAP_CLAMP_TO_EDGE;
}

function getWidth()
{
    let x = 0;
    if (inTex.get() && inSize.get() == "Auto") x = inTex.get().width;
    else if (inSize.get() == "Auto" || inSize.get() == "Canvas") x = cgl.canvasWidth;
    else if (inSize.get() == "ViewPort") x = cgl.getViewPort()[2];
    else x = Math.ceil(width.get());
    return op.patch.cgl.checkTextureSize(x);
}

function getHeight()
{
    let x = 0;

    if (inTex.get() && inSize.get() == "Auto") x = inTex.get().height;
    else if (inSize.get() == "Auto" || inSize.get() == "Canvas") x = cgl.canvasHeight;
    else if (inSize.get() == "ViewPort") x = cgl.getViewPort()[3];
    else x = Math.ceil(height.get());
    return op.patch.cgl.checkTextureSize(x);
}

function reInitLater()
{
    reInitEffect = true;
}

function updateResolution()
{
    if ((
        getWidth() != tex.width ||
        getHeight() != tex.height ||
        // tex.anisotropic != parseFloat(aniso.get()) ||
        // tex.isFloatingPoint() != CGL.Texture.isPixelFormatFloat(inPixelFormat.get()) ||
        tex.pixelFormat != inPixelFormat.get() ||
        tex.filter != getFilter() ||
        tex.wrap != getWrap()
    ) && (getWidth() !== 0 && getHeight() !== 0))
    {
        initEffect();
        effect.setSourceTexture(tex);
        // texOut.set(CGL.Texture.getEmptyTexture(cgl));
        texOut.setRef(tex);
        updateResolutionInfo();
        checkTypes();
    }
}

function updateResolutionInfo()
{
    let info = null;

    if (inSize.get() == "Manual")
    {
        info = null;
    }
    else if (inSize.get() == "Auto")
    {
        if (inTex.get()) info = "Input Texture";
        else info = "Canvas Size";

        info += ": " + getWidth() + " x " + getHeight();
    }

    let changed = false;
    changed = inSize.uiAttribs.info != info;
    inSize.setUiAttribs({ "info": info });
    if (changed)op.refreshParams();
}

function updateDefines()
{
    if (copyShader)copyShader.toggleDefine("USE_TEX", inTex.isLinked() || !inClear.get());
    if (copyShader)copyShader.toggleDefine("USE_UVTEX", inUVTex.isLinked());
}

function updateUi()
{
    aniso.setUiAttribs({ "greyout": getFilter() != CGL.Texture.FILTER_MIPMAP });

    r.setUiAttribs({ "greyout": inTex.isLinked() });
    b.setUiAttribs({ "greyout": inTex.isLinked() });
    g.setUiAttribs({ "greyout": inTex.isLinked() });
    a.setUiAttribs({ "greyout": inTex.isLinked() });

    inClear.setUiAttribs({ "greyout": inTex.isLinked() });
    width.setUiAttribs({ "greyout": inSize.get() != "Manual" });
    height.setUiAttribs({ "greyout": inSize.get() != "Manual" });

    // width.setUiAttribs({ "hideParam": inSize.get() != "Manual" });
    // height.setUiAttribs({ "hideParam": inSize.get() != "Manual" });

    if (tex)
        if (CGL.Texture.isPixelFormatFloat(inPixelFormat.get()) && getFilter() == CGL.Texture.FILTER_MIPMAP) op.setUiError("fpmipmap", "Don't use mipmap and 32bit at the same time, many systems do not support this.", 1);
        else op.setUiError("fpmipmap", null);

    updateResolutionInfo();
    updateDefines();
    checkTypes();
}

function checkTypes()
{
    if (tex)
        if (inTex.isLinked() && inTex.get() && (tex.isFloatingPoint() < inTex.get().isFloatingPoint()))
            op.setUiError("textypediff", "Warning: Mixing floating point and non floating point texture can result in data/precision loss", 1);
        else
            op.setUiError("textypediff", null);
}

op.preRender = () =>
{
    doRender();
};

function copyTexture()
{
    if (!copyShader)
    {
        copyShader = new CGL.Shader(cgl, "copytextureshader");
        copyShader.setSource(copyShader.getDefaultVertexShader(), attachments.imgcomp_frag);
        copyShaderTexUni = new CGL.Uniform(copyShader, "t", "tex", 0);
        copyShaderUVTexUni = new CGL.Uniform(copyShader, "t", "UVTex", 1);
        copyShaderRGBAUni = new CGL.Uniform(copyShader, "4f", "bgColor", r, g, b, a);
        updateDefines();
    }

    cgl.pushShader(copyShader);
    cgl.currentTextureEffect.bind();

    if (inTex.get()) cgl.setTexture(0, inTex.get().tex);
    else if (!inClear.get() && texOut.get()) cgl.setTexture(0, texOut.get().tex);
    if (inUVTex.get()) cgl.setTexture(1, inUVTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();
}

function doRender()
{
    if (!effect || reInitEffect) initEffect();

    cgl.pushBlend(false);

    updateResolution();

    const oldEffect = cgl.currentTextureEffect;
    cgl.currentTextureEffect = effect;
    cgl.currentTextureEffect.imgCompVer = 3;
    cgl.currentTextureEffect.width = width.get();
    cgl.currentTextureEffect.height = height.get();
    effect.setSourceTexture(tex);

    effect.startEffect(inTex.get() || CGL.Texture.getEmptyTexture(cgl, isFloatTex), true);
    copyTexture();

    trigger.trigger();

    cgl.pushViewPort(0, 0, width.get(), height.get());

    effect.endEffect();
    texOut.setRef(effect.getCurrentSourceTexture());

    cgl.popViewPort();

    cgl.popBlend();
    cgl.currentTextureEffect = oldEffect;
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Fog_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.Fog_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"fog_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D texDepth;\n\n#ifdef HAS_GRADIENT_TEX\n    UNI sampler2D texGradient;\n#endif\n\n#ifdef HAS_BG_TEX\n    UNI sampler2D texBg;\n#endif\n\nUNI float nearPlane;\nUNI float farPlane;\nUNI float inAmount;\nUNI vec4 inFogColor;\nUNI float inFogDensity;\nUNI float inFogStart;\nUNI float inFogEnd;\n\n{{CGL.BLENDMODES3}}\n\nfloat map(float value, float min1, float max1, float min2, float max2) {\n  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n}\n\nfloat CalcFogDensity(float depth) {\n    float fogAmount = 1.0 - clamp((inFogEnd - depth) / (inFogEnd - inFogStart), 0.0, 1.0);\n\n    // float newDepth = map(depth, nearPlane, farPlane, 0., 1.);\n    // EXPONENTIAL: fogAmount = 1. - exp(MAGIC_NUMBER * -inFogDensity * newDepth); // smoothstep(fogStart, fogEnd, newDepth));\n    // EXP2: fogAmount = 1. - exp(-pow(MAGIC_NUMBER * inFogDensity * smoothstep(fogStart, fogEnd, newDepth), 2.0));\n\n    fogAmount *= inFogDensity;\n\n\n\n    return fogAmount;\n}\n\nvoid main()\n{\n    vec4 color = texture(tex, texCoord);\n\n    float depthFromTexture = texture(texDepth,texCoord).r;\n\n    float distanceToCamera_viewSpace = (nearPlane * farPlane) / (farPlane - depthFromTexture * (farPlane - nearPlane));\n\n    float fogAmount = CalcFogDensity(distanceToCamera_viewSpace);\n\n    vec4 fogColor = inFogColor;\n\n    #ifdef HAS_GRADIENT_TEX\n        vec4 fogColTex = texture(texGradient, vec2(clamp(distanceToCamera_viewSpace / (farPlane - nearPlane), 0.0, 0.9999),0.5));\n        fogColor *= fogColTex;\n    #endif\n\n    #ifdef HAS_BG_TEX\n        vec4 fogColTexBg = texture(texBg, texCoord);\n        fogColor *= fogColTexBg;\n\n    #endif\n\n    fogColor = color * (1.0 - fogAmount) + fogColor * fogAmount;\n    // fogColor = mix(color, fogColor, fogAmount);\n\n\n    #ifdef IGNORE_INF\n        if(depthFromTexture>0.99999) outColor=color;\n        else outColor = cgl_blendPixel(color, fogColor, inAmount);\n    #endif\n\n    #ifndef IGNORE_INF\n        outColor = cgl_blendPixel(color, fogColor, inAmount);\n    #endif\n\n}\n","fog_vert":"IN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\n\nOUT vec2 texCoord;\nOUT vec3 norm;\n\nUNI mat4 projMatrix;\nUNI mat4 mvMatrix;\nUNI mat4 modelMatrix;\n\nvoid main()\n{\n    texCoord = attrTexCoord;\n    norm = attrVertNormal;\n    vec4 pos = vec4(vPosition,  1.0);\n\n    {{MODULE_VERTEX_POSITION}}\n\n    gl_Position = projMatrix * mvMatrix * pos;\n\n}\n",};
const cgl = op.patch.cgl;
const render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "blendMode"),
    inAmount = op.inFloatSlider("Amount", 1),
    image = op.inTexture("Depth Texture"),
    inGradientTexture = op.inTexture("Gradient Texture"),
    inBgTex = op.inTexture("Background Texture"),
    inFogStart = op.inFloat("Fog Start", 1),
    inFogEnd = op.inFloat("Fog End", 8),
    inFogDensity = op.inFloatSlider("Fog Density", 1),
    inIgnoreInf = op.inBool("Ignore Infinity", false),
    nearPlane = op.inFloat("nearplane", 0.1),
    farPlane = op.inFloat("farplane", 20),
    inFogR = op.inFloatSlider("Fog R", 0.6),
    inFogG = op.inFloatSlider("Fog G", 0.6),
    inFogB = op.inFloatSlider("Fog B", 0.6),
    inFogA = op.inFloatSlider("Fog A", 1),
    trigger = op.outTrigger("trigger");

inFogR.setUiAttribs({ "colorPick": true });

op.setPortGroup("Textures", [image, inGradientTexture, inBgTex]);
op.setPortGroup("Frustum", [farPlane, nearPlane]);
op.setPortGroup("Fog Options", [inFogStart, inFogEnd, inFogDensity]);
op.setPortGroup("Fog Color", [inFogR, inFogG, inFogB, inFogA]);

const shader = new CGL.Shader(cgl, "Fog");
const srcFrag = attachments.fog_frag;
const srcVert = attachments.fog_vert;
shader.setSource(srcVert, srcFrag);

const
    uniAmount = new CGL.Uniform(shader, "f", "inAmount", inAmount),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    depthTextureUniform = new CGL.Uniform(shader, "t", "texDepth", 1),
    uniGradientTexture = new CGL.Uniform(shader, "t", "texGradient", 2),
    uniBgTexture = new CGL.Uniform(shader, "t", "texBg", 3),
    uniFarplane = new CGL.Uniform(shader, "f", "farPlane", farPlane),
    uniNearplane = new CGL.Uniform(shader, "f", "nearPlane", nearPlane),
    uniAspect = new CGL.Uniform(shader, "f", "aspectRatio", 0),
    uniFogColor = new CGL.Uniform(shader, "4f", "inFogColor", inFogR, inFogG, inFogB, inFogA),
    uniFogDensity = new CGL.Uniform(shader, "f", "inFogDensity", inFogDensity),
    uniFogStart = new CGL.Uniform(shader, "f", "inFogStart", inFogStart),
    uniFogEnd = new CGL.Uniform(shader, "f", "inFogEnd", inFogEnd);

CGL.TextureEffect.setupBlending(op, shader, blendMode, inAmount);

let texturesChanged = false;
inGradientTexture.onChange =
inBgTex.onChange = () =>
{
    texturesChanged = true;
};

function updateDefines()
{
    shader.toggleDefine("HAS_BG_TEX", inBgTex.get() && inBgTex.get().tex);
    shader.toggleDefine("IGNORE_INF", inIgnoreInf.get());
    shader.toggleDefine("HAS_GRADIENT_TEX", inGradientTexture.get() && inGradientTexture.get().tex);
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;
    if (!image.get())
    {
        op.setUiError("noDepthTex", "This op needs a depth texture to work properly!", 0);
    }
    else
    {
        op.setUiError("noDepthTex", null);
    }

    if (texturesChanged)updateDefines();

    if (image.get() && image.get().tex)
    {
        const a =
            cgl.currentTextureEffect.getCurrentSourceTexture().height
            / cgl.currentTextureEffect.getCurrentSourceTexture().width;

        uniAspect.set(a);

        cgl.pushShader(shader);
        cgl.currentTextureEffect.bind();

        cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
        if (image.get()) cgl.setTexture(1, image.get().tex);
        if (inGradientTexture.get()) cgl.setTexture(2, inGradientTexture.get().tex);
        if (inBgTex.get()) cgl.setTexture(3, inBgTex.get().tex);
        cgl.currentTextureEffect.finish();
        cgl.popShader();
    }

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Noise.Noise_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Noise.Noise_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"noise_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\nUNI float time;\nUNI float thresh;\n\n#ifdef HAS_MULMASK\n    UNI sampler2D texMul;\n#endif\n\n{{CGL.BLENDMODES3}}\n{{MODULES_HEAD}}\n\n{{CGL.RANDOM_TEX}}\n\nvoid main()\n{\n    vec4 rnd;\n\n    #ifdef RGB\n        rnd=vec4(cgl_random3(texCoord.xy+vec2(time)),1.0);\n    #else\n        float r=cgl_random(texCoord.xy+vec2(time));\n        rnd=vec4( r,r,r,1.0 );\n    #endif\n\n    vec4 base=texture(tex,texCoord);\n    vec4 col=rnd;//( _blend(base.rgb,rnd.rgb) ,1.0);\n\n    #ifdef NORMALIZE\n        col.rgb=(col.rgb-0.5)*2.0;\n    #endif\n\n    #ifdef HAS_MULMASK\n        col.rgb*=texture(texMul,texCoord).rgb;\n    #endif\n\n    col*=step(thresh,cgl_random(texCoord.xy*11.0+vec2(time)));\n\n\n    outColor=cgl_blendPixel(base,col,amount);\n}",};
const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    amount = op.inValueSlider("Amount", 1),
    thresh = op.inValueSlider("Threshold", 0),
    animated = op.inValueBool("Animated", true),
    inRGB = op.inValueBool("RGB", false),
    normalize = op.inValueBool("Normalize", false),
    inTexMul = op.inTexture("Multiply"),
    trigger = op.outTrigger("Next");

const
    cgl = op.patch.cgl,
    shader = new CGL.Shader(cgl, op.name),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    timeUniform = new CGL.Uniform(shader, "f", "time", 1.0),
    thresuni = new CGL.Uniform(shader, "f", "thresh", thresh),
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    mulUniform = new CGL.Uniform(shader, "t", "texMul", 1);

shader.setSource(shader.getDefaultVertexShader(), attachments.noise_frag);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

op.toWorkPortsNeedToBeLinked(render);

inTexMul.onChange =
normalize.onChange =
inRGB.onChange = function ()
{
    shader.toggleDefine("HAS_MULMASK", inTexMul.get());
    shader.toggleDefine("RGB", inRGB.get());
    shader.toggleDefine("NORMALIZE", normalize.get());
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    if (animated.get()) timeUniform.setValue(op.patch.freeTimer.get() / 1000 % 100);
    else timeUniform.setValue(0);

    cgl.pushShader(shader);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexMul.get())cgl.setTexture(1, inTexMul.get().tex);

    cgl.currentTextureEffect.bind();

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.FullscreenRectangle_v2
// 
// **************************************************************

Ops.Gl.Meshes.FullscreenRectangle_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"shader_frag":"UNI sampler2D tex;\nIN vec2 texCoord;\n\nvoid main()\n{\n    outColor= texture(tex,texCoord);\n}\n\n","shader_vert":"{{MODULES_HEAD}}\n\nIN vec3 vPosition;\nUNI mat4 projMatrix;\nUNI mat4 mvMatrix;\n\nOUT vec2 texCoord;\nIN vec2 attrTexCoord;\n\nvoid main()\n{\n   vec4 pos=vec4(vPosition,  1.0);\n\n   texCoord=vec2(attrTexCoord.x,(1.0-attrTexCoord.y));\n\n   gl_Position = projMatrix * mvMatrix * pos;\n}\n",};
const
    render = op.inTrigger("render"),
    inScale = op.inSwitch("Scale", ["Stretch", "Fit"], "Fit"),
    flipY = op.inValueBool("Flip Y"),
    flipX = op.inValueBool("Flip X"),
    inTexture = op.inTexture("Texture"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
let mesh = null;
let geom = new CGL.Geometry("fullscreen rectangle");
let x = 0, y = 0, w = 0, h = 0;

op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);
op.toWorkPortsNeedToBeLinked(render);

flipX.onChange = rebuildFlip;
flipY.onChange = rebuildFlip;
render.onTriggered = doRender;
inTexture.onLinkChanged = updateUi;
inScale.onChange = updateScale;

const shader = new CGL.Shader(cgl, "fullscreenrectangle", this);
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

shader.setSource(attachments.shader_vert, attachments.shader_frag);
shader.fullscreenRectUniform = new CGL.Uniform(shader, "t", "tex", 0);
shader.aspectUni = new CGL.Uniform(shader, "f", "aspectTex", 0);

let useShader = false;
let updateShaderLater = true;
let fitImageAspect = false;

updateUi();
updateScale();

inTexture.onChange = function ()
{
    updateShaderLater = true;
};

function updateUi()
{
    if (!CABLES.UI) return;
    flipY.setUiAttribs({ "greyout": !inTexture.isLinked() });
    flipX.setUiAttribs({ "greyout": !inTexture.isLinked() });
    inScale.setUiAttribs({ "greyout": !inTexture.isLinked() });
}

function updateShader()
{
    let tex = inTexture.get();
    if (tex) useShader = true;
    else useShader = false;
}

op.preRender = function ()
{
    updateShader();
    shader.bind();
    if (mesh)mesh.render(shader);
    doRender();
};

function updateScale()
{
    fitImageAspect = inScale.get() == "Fit";
}

function doRender()
{
    if (cgl.viewPort[2] != w || cgl.viewPort[3] != h || !mesh) rebuild();

    if (updateShaderLater) updateShader();

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    mat4.ortho(cgl.pMatrix, 0, w, h, 0, -10.0, 1000);

    cgl.pushModelMatrix();
    mat4.identity(cgl.mMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    if (fitImageAspect && inTexture.get())
    {
        const rat = inTexture.get().width / inTexture.get().height;

        let _h = h;
        let _w = h * rat;

        if (_w > w)
        {
            _h = w * 1 / rat;
            _w = w;
        }

        cgl.pushViewPort((w - _w) / 2, (h - _h) / 2, _w, _h);
    }

    if (useShader)
    {
        if (inTexture.get()) cgl.setTexture(0, inTexture.get().tex);
        mesh.render(shader);
    }
    else
    {
        mesh.render(cgl.getShader());
    }

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    if (fitImageAspect && inTexture.get()) cgl.popViewPort();

    trigger.trigger();
}

function rebuildFlip()
{
    mesh = null;
}

function rebuild()
{
    if (cgl.viewPort[2] == w && cgl.viewPort[3] == h && mesh) return;

    let xx = 0, xy = 0;

    w = cgl.viewPort[2];
    h = cgl.viewPort[3];

    geom.vertices = new Float32Array([
        xx + w, xy + h, 0.0,
        xx, xy + h, 0.0,
        xx + w, xy, 0.0,
        xx, xy, 0.0
    ]);

    let tc = null;

    if (flipY.get())
        tc = new Float32Array([
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]);
    else
        tc = new Float32Array([
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]);

    if (flipX.get())
    {
        tc[0] = 0.0;
        tc[2] = 1.0;
        tc[4] = 0.0;
        tc[6] = 1.0;
    }

    geom.setTexCoords(tc);

    geom.verticesIndices = new Uint16Array([
        2, 1, 0,
        3, 1, 2
    ]);

    geom.vertexNormals = new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
    ]);
    geom.tangents = new Float32Array([
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0]);
    geom.biTangents == new Float32Array([
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0]);

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);
}

}
};






// **************************************************************
// 
// Ops.Gl.RenderToTexture_v3
// 
// **************************************************************

Ops.Gl.RenderToTexture_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    inSize = op.inSwitch("Size", ["Canvas", "Manual"], "Canvas"),
    width = op.inValueInt("texture width", 512),
    height = op.inValueInt("texture height", 512),
    aspect = op.inBool("Auto Aspect", true),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inSwitch("Wrap", ["Clamp", "Repeat", "Mirror"], "Repeat"),
    msaa = op.inSwitch("MSAA", ["none", "2x", "4x", "8x"], "none"),
    trigger = op.outTrigger("trigger"),
    tex = op.outTexture("texture"),
    texDepth = op.outTexture("textureDepth"),
    outFb = op.outObject("Framebuffer", null, "framebuffer"),
    inPixelFormat = op.inDropDown("Pixel Format", CGL.Texture.PIXELFORMATS, CGL.Texture.PFORMATSTR_RGBA8UB),
    depth = op.inValueBool("Depth", true),
    clear = op.inValueBool("Clear", true);

const cgl = op.patch.cgl;
let fb = null;
let reInitFb = true;

op.setPortGroup("Size", [inSize, width, height, aspect]);

inPixelFormat.onChange =
    depth.onChange =
    clear.onChange =
    tfilter.onChange =
    twrap.onChange =
    msaa.onChange = initFbLater;

inSize.onChange = updateUi;

render.onTriggered =
    op.preRender = doRender;

updateUi();

function updateUi()
{
    width.setUiAttribs({ "greyout": inSize.get() != "Manual" });
    height.setUiAttribs({ "greyout": inSize.get() != "Manual" });
    aspect.setUiAttribs({ "greyout": inSize.get() != "Manual" });
}

function initFbLater()
{
    reInitFb = true;
}

function doRender()
{
    CGL.TextureEffect.checkOpNotInTextureEffect(op);

    if (!fb || reInitFb)
    {
        if (fb) fb.delete();

        let selectedWrap = CGL.Texture.WRAP_REPEAT;
        if (twrap.get() == "Clamp") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;
        else if (twrap.get() == "Mirror") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;

        let selectFilter = CGL.Texture.FILTER_NEAREST;
        if (tfilter.get() == "nearest") selectFilter = CGL.Texture.FILTER_NEAREST;
        else if (tfilter.get() == "linear") selectFilter = CGL.Texture.FILTER_LINEAR;
        else if (tfilter.get() == "mipmap") selectFilter = CGL.Texture.FILTER_MIPMAP;

        if (inPixelFormat.get().indexOf("loat") > -1 && tfilter.get() == "mipmap") op.setUiError("fpmipmap", "Can't use mipmap and float texture at the same time");
        else op.setUiError("fpmipmap", null);

        if (cgl.glVersion >= 2)
        {
            let ms = true;
            let msSamples = 4;

            if (msaa.get() == "none")
            {
                msSamples = 0;
                ms = false;
            }
            if (msaa.get() == "2x") msSamples = 2;
            if (msaa.get() == "4x") msSamples = 4;
            if (msaa.get() == "8x") msSamples = 8;

            fb = new CGL.Framebuffer2(cgl, 8, 8, {
                "name": "render2texture " + op.id,
                "pixelFormat": inPixelFormat.get(),
                "multisampling": ms,
                "multisamplingSamples": msSamples,
                "wrap": selectedWrap,
                "filter": selectFilter,
                "depth": depth.get(),
                "clear": clear.get()
            });

            outFb.setRef(fb);
        }
        else
        {
            fb = new CGL.Framebuffer(cgl, 8, 8, { "isFloatingPointTexture": false, "clear": clear.get() });
        }

        if (fb && fb.valid)
        {
            texDepth.setRef(fb.getTextureDepth());
            reInitFb = false;
        }
        else
        {
            fb = null;
            reInitFb = true;
        }
    }

    let setAspect = aspect.get();

    if (inSize.get() == "Canvas")
    {
        setAspect = true;
        width.set(op.patch.cgl.checkTextureSize(cgl.canvasWidth));
        height.set(op.patch.cgl.checkTextureSize(cgl.canvasHeight));
    }

    if (fb.getWidth() != op.patch.cgl.checkTextureSize(width.get()) || fb.getHeight() != op.patch.cgl.checkTextureSize(height.get()))
    {
        fb.setSize(
            op.patch.cgl.checkTextureSize(width.get()),
            op.patch.cgl.checkTextureSize(height.get()));
    }

    fb.renderStart(cgl);

    cgl.pushViewPort(0, 0, width.get(), height.get());

    if (setAspect) mat4.perspective(cgl.pMatrix, 45, width.get() / height.get(), 0.1, 1000.0);

    trigger.trigger();
    fb.renderEnd(cgl);

    cgl.popViewPort();

    texDepth.setRef(fb.getTextureDepth());
    tex.setRef(fb.getTextureColor());
}

//

}
};






// **************************************************************
// 
// Ops.Graphics.Meshes.Sphere_v3
// 
// **************************************************************

Ops.Graphics.Meshes.Sphere_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    TAU = Math.PI * 2,
    inTrigger = op.inTrigger("render"),
    inRadius = op.inValue("radius", 0.5),
    inStacks = op.inValue("stacks", 32),
    inSlices = op.inValue("slices", 32),
    inStacklimit = op.inValueSlider("Filloffset", 1),
    inDraw = op.inValueBool("Render", true),
    outTrigger = op.outTrigger("trigger"),
    outGeometry = op.outObject("geometry", null, "geometry"),
    UP = vec3.fromValues(0, 1, 0),
    RIGHT = vec3.fromValues(1, 0, 0);

let
    cgl = null,
    geom = new CGL.Geometry("Sphere"),
    tmpNormal = vec3.create(),
    tmpVec = vec3.create(),
    needsRebuild = true,
    lastRadius = 0.0,
    doScale = true,
    vScale = vec3.create(),
    mesh = null;
updateScale();
op.onDelete = function () { if (mesh)mesh.dispose(); };

inDraw.onChange = () => { op.setUiAttrib({ "extendTitle": inDraw.get() ? "" : "x" }); };

inTrigger.onTriggered = function ()
{
    cgl = op.patch.cg || op.patch.cgl;
    if (needsRebuild) buildMesh();

    if (doScale)
    {
        cgl.pushModelMatrix();
        mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);
    }

    if (inDraw.get()) mesh.render(cgl.getShader());

    if (doScale)
    {
        cgl.popModelMatrix();
    }

    outTrigger.trigger();
};

inStacks.onChange =
    inSlices.onChange =
    inStacklimit.onChange =
        () =>
        {
            needsRebuild = true;
        };

outGeometry.onLinkChanged =
    inRadius.onChange =
        () =>
        {
            if (outGeometry.isLinked()) doScale = false;
            else doScale = true;

            if (doScale) updateScale();
            else needsRebuild = true;
        };

function updateScale()
{
    if (doScale && lastRadius != 1.0)needsRebuild = true;
    vec3.set(vScale, inRadius.get(), inRadius.get(), inRadius.get());
}

function buildMesh()
{
    const
        stacks = Math.ceil(Math.max(inStacks.get(), 2)),
        slices = Math.ceil(Math.max(inSlices.get(), 3)),
        stackLimit = Math.min(Math.max(inStacklimit.get() * stacks, 1), stacks);
    let radius = inRadius.get();

    if (doScale)radius = 1.0;
    lastRadius = radius;
    let
        positions = [],
        texcoords = [],
        normals = [],
        tangents = [],
        biTangents = [],
        indices = [],
        x, y, z, d, t, a,
        o, u, v, i, j;
    for (i = o = 0; i < stacks + 1; i++)
    {
        v = (i / stacks - 0.5) * Math.PI;
        y = Math.sin(v);
        a = Math.cos(v);
        // for (j = 0; j < slices+1; j++) {
        for (j = slices; j >= 0; j--)
        {
            u = (j / slices) * TAU;
            x = Math.cos(u) * a;
            z = Math.sin(u) * a;

            positions.push(x * radius, y * radius, z * radius);
            // texcoords.push(i/(stacks+1),j/slices);
            texcoords.push(j / slices, i / (stacks + 1));

            d = Math.sqrt(x * x + y * y + z * z);
            normals.push(
                tmpNormal[0] = x / d,
                tmpNormal[1] = y / d,
                tmpNormal[2] = z / d
            );

            if (y == d) t = RIGHT;
            else t = UP;
            vec3.cross(tmpVec, tmpNormal, t);
            vec3.normalize(tmpVec, tmpVec);
            Array.prototype.push.apply(tangents, tmpVec);
            vec3.cross(tmpVec, tmpVec, tmpNormal);
            Array.prototype.push.apply(biTangents, tmpVec);
        }
        if (i == 0 || i > stackLimit) continue;
        for (j = 0; j < slices; j++, o++)
        {
            indices.push(
                o, o + 1, o + slices + 1, o + 1, o + slices + 2, o + slices + 1
            );
        }
        o++;
    }

    // set geometry
    geom.clear();
    geom.vertices = positions;
    geom.texCoords = texcoords;
    geom.vertexNormals = normals;
    geom.tangents = tangents;
    geom.biTangents = biTangents;
    geom.verticesIndices = indices;

    outGeometry.setRef(geom);

    if (op.patch.cg) // only generate mesh when there is a cg available, otherwise only outputs a geometry
        if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        else mesh.setGeom(geom);

    needsRebuild = false;
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Noise.FBMNoise_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Noise.FBMNoise_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"fbmnoise_frag":"UNI sampler2D tex;\nUNI float anim;\n\nUNI float scale;\nUNI float repeat;\n\nUNI float scrollX;\nUNI float scrollY;\n\nUNI float amount;\n\nUNI bool layer1;\nUNI bool layer2;\nUNI bool layer3;\nUNI bool layer4;\nUNI vec3 color;\nUNI float aspect;\n\nIN vec2 texCoord;\n\n\n{{CGL.BLENDMODES3}}\n\n// adapted from warp shader by inigo quilez/iq\n// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.\n\n// See here for a tutorial on how to make this: http://www.iquilezles.org/www/articles/warp/warp.htm\n\nconst mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );\n\nfloat noise( in vec2 x )\n{\n\treturn sin(1.5*x.x)*sin(1.5*x.y);\n}\n\nfloat fbm4( vec2 p )\n{\n    float f = 0.0;\n    f += 0.5000*noise( p ); p = m*p*2.02;\n    f += 0.2500*noise( p ); p = m*p*2.03;\n    f += 0.1250*noise( p ); p = m*p*2.01;\n    f += 0.0625*noise( p );\n    return f/0.9375;\n}\n\nfloat fbm6( vec2 p )\n{\n    float f = 0.0;\n    f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;\n    f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;\n    f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;\n    f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;\n    f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;\n    f += 0.015625*(0.5+0.5*noise( p ));\n    return f/0.96875;\n}\n\nvoid main()\n{\n    vec2 tc=texCoord;\n\t#ifdef DO_TILEABLE\n\t    tc=abs(texCoord-0.5);\n\t#endif\n\n    vec2 p=(tc-0.5)*scale;\n\n    p.y/=aspect;\n    vec2 q = vec2( fbm4( p + vec2(0.3+scrollX,0.20+scrollY) ),\n                   fbm4( p + vec2(3.1+scrollX,1.3+scrollY) ) );\n\n    vec2 q2 = vec2( fbm4( p + vec2(2.0+scrollX,1.0+scrollY) ),\n                   fbm4( p + vec2(3.1+scrollX,1.3+scrollY) ) );\n\n    vec2 q3 = vec2( fbm4( p + vec2(9.0+scrollX,4.0+scrollY) ),\n                   fbm4( p + vec2(3.1+scrollX,4.3+scrollY) ) );\n\n    float v= fbm4( ( p + 4.0*q +anim*0.1)*repeat);\n    float v2= fbm4( (p + 4.0*q2 +anim*0.1)*repeat );\n\n    float v3= fbm6( (p + 4.0*q3 +anim*0.1)*repeat );\n    float v4= fbm6( (p + 4.0*q2 +anim*0.1)*repeat );\n\n    vec4 base=texture(tex,texCoord);\n\n    vec4 finalColor;\n    float colVal=0.0;\n    float numLayers=0.0;\n\n    if(layer1)\n    {\n        colVal+=v;\n        numLayers++;\n    }\n\n    if(layer2)\n    {\n        colVal+=v2;\n        numLayers++;\n    }\n\n    if(layer3)\n    {\n        colVal+=v3;\n        numLayers++;\n    }\n\n    if(layer4)\n    {\n        colVal+=v4;\n        numLayers++;\n    }\n\n    finalColor=vec4( color*vec3(colVal/numLayers),1.0);\n\n    outColor = cgl_blendPixel(base,finalColor,amount);\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    r = op.inValueSlider("r", 1.0),
    g = op.inValueSlider("g", 1.0),
    b = op.inValueSlider("b", 1.0),
    trigger = op.outTrigger("trigger");

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "fbmnoise");

shader.setSource(shader.getDefaultVertexShader(), attachments.fbmnoise_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniScale = new CGL.Uniform(shader, "f", "scale", op.inValue("scale", 2)),
    uniAnim = new CGL.Uniform(shader, "f", "anim", op.inValue("anim", 0)),
    uniScrollX = new CGL.Uniform(shader, "f", "scrollX", op.inValue("scrollX", 9)),
    uniScrollY = new CGL.Uniform(shader, "f", "scrollY", op.inValue("scrollY", 0)),
    uniRepeat = new CGL.Uniform(shader, "f", "repeat", op.inValue("repeat", 1)),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", op.inValue("aspect", 1)),
    uniLayer1 = new CGL.Uniform(shader, "b", "layer1", op.inValueBool("Layer 1", true)),
    uniLayer2 = new CGL.Uniform(shader, "b", "layer2", op.inValueBool("Layer 2", true)),
    uniLayer3 = new CGL.Uniform(shader, "b", "layer3", op.inValueBool("Layer 3", true)),
    uniLayer4 = new CGL.Uniform(shader, "b", "layer4", op.inValueBool("Layer 4", true)),
    uniColor = new CGL.Uniform(shader, "3f", "color", r, g, b),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

const tile = op.inValueBool("Tileable", false);
tile.onChange = updateTileable;

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

function updateTileable()
{
    shader.toggleDefine("DO_TILEABLE", tile.get());
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.set(cgl.currentTextureEffect.getCurrentSourceTexture().width / cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Graphics.Meshes.Rectangle_v4
// 
// **************************************************************

Ops.Graphics.Meshes.Rectangle_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    doRender = op.inValueBool("Render Mesh", true),
    width = op.inValue("width", 1),
    height = op.inValue("height", 1),
    pivotX = op.inSwitch("pivot x", ["left", "center", "right"], "center"),
    pivotY = op.inSwitch("pivot y", ["top", "center", "bottom"], "center"),
    axis = op.inSwitch("axis", ["xy", "xz"], "xy"),
    flipTcX = op.inBool("Flip TexCoord X", false),
    flipTcY = op.inBool("Flip TexCoord Y", true),
    nColumns = op.inValueInt("num columns", 1),
    nRows = op.inValueInt("num rows", 1),
    trigger = op.outTrigger("trigger"),
    geomOut = op.outObject("geometry", null, "geometry");

geomOut.ignoreValueSerialize = true;

const geom = new CG.Geometry("rectangle");

doRender.setUiAttribs({ "title": "Render" });
render.setUiAttribs({ "title": "Trigger" });
trigger.setUiAttribs({ "title": "Next" });
op.setPortGroup("Pivot", [pivotX, pivotY, axis]);
op.setPortGroup("Size", [width, height]);
op.setPortGroup("Structure", [nColumns, nRows]);
op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_TRIGGER);

const AXIS_XY = 0;
const AXIS_XZ = 1;

let curAxis = AXIS_XY;
let mesh = null;
let needsRebuild = true;
let doScale = true;

const vScale = vec3.create();
vec3.set(vScale, 1, 1, 1);

axis.onChange =
    pivotX.onChange =
    pivotY.onChange =
    flipTcX.onChange =
    flipTcY.onChange =
    nRows.onChange =
    nColumns.onChange = rebuildLater;
updateScale();

doRender.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": doRender.get() ? "" : "X" });
};

width.onChange =
    height.onChange =
    () =>
    {
        if (doScale) updateScale();
        else needsRebuild = true;
    };

function updateScale()
{
    if (curAxis === AXIS_XY) vec3.set(vScale, width.get(), height.get(), 1);
    if (curAxis === AXIS_XZ) vec3.set(vScale, width.get(), 1, height.get());
}

geomOut.onLinkChanged = () =>
{
    doScale = !geomOut.isLinked();
    updateScale();
    needsRebuild = true;
};

function rebuildLater()
{
    needsRebuild = true;
}

render.onTriggered = () =>
{
    if (needsRebuild) rebuild();
    const cg = op.patch.cg;
    if (cg && mesh && doRender.get())
    {
        if (doScale)
        {
            cg.pushModelMatrix();
            mat4.scale(cg.mMatrix, cg.mMatrix, vScale);
        }

        mesh.render(cg.getShader());

        if (doScale) cg.popModelMatrix();
    }

    trigger.trigger();
};

op.onDelete = function () { if (mesh)mesh.dispose(); };

function rebuild()
{
    if (axis.get() == "xy") curAxis = AXIS_XY;
    if (axis.get() == "xz") curAxis = AXIS_XZ;

    updateScale();
    let w = width.get();
    let h = height.get();

    if (doScale) w = h = 1;

    let x = 0;
    let y = 0;

    if (pivotX.get() == "center") x = 0;
    else if (pivotX.get() == "right") x = -w / 2;
    else if (pivotX.get() == "left") x = +w / 2;

    if (pivotY.get() == "center") y = 0;
    else if (pivotY.get() == "top") y = -h / 2;
    else if (pivotY.get() == "bottom") y = +h / 2;

    const numRows = Math.max(1, Math.round(nRows.get()));
    const numColumns = Math.max(1, Math.round(nColumns.get()));

    const stepColumn = w / numColumns;
    const stepRow = h / numRows;

    const indices = [];
    const tc = new Float32Array((numColumns + 1) * (numRows + 1) * 2);
    const verts = new Float32Array((numColumns + 1) * (numRows + 1) * 3);
    const norms = new Float32Array((numColumns + 1) * (numRows + 1) * 3);
    const tangents = new Float32Array((numColumns + 1) * (numRows + 1) * 3);
    const biTangents = new Float32Array((numColumns + 1) * (numRows + 1) * 3);

    let idxTc = 0;
    let idxVert = 0;
    let idxNorms = 0;
    let idxTangent = 0;
    let idxBiTangent = 0;

    for (let r = 0; r <= numRows; r++)
    {
        for (let c = 0; c <= numColumns; c++)
        {
            verts[idxVert++] = c * stepColumn - w / 2 + x;
            if (curAxis == AXIS_XZ) verts[idxVert++] = 0;
            verts[idxVert++] = r * stepRow - h / 2 + y;

            if (curAxis == AXIS_XY)verts[idxVert++] = 0;

            tc[idxTc++] = c / numColumns;
            tc[idxTc++] = r / numRows;

            if (curAxis == AXIS_XY) // default
            {
                norms[idxNorms++] = 0;
                norms[idxNorms++] = 0;
                norms[idxNorms++] = 1;

                tangents[idxTangent++] = 1;
                tangents[idxTangent++] = 0;
                tangents[idxTangent++] = 0;

                biTangents[idxBiTangent++] = 0;
                biTangents[idxBiTangent++] = 1;
                biTangents[idxBiTangent++] = 0;
            }
            else if (curAxis == AXIS_XZ)
            {
                norms[idxNorms++] = 0;
                norms[idxNorms++] = 1;
                norms[idxNorms++] = 0;

                biTangents[idxBiTangent++] = 0;
                biTangents[idxBiTangent++] = 0;
                biTangents[idxBiTangent++] = 1;
            }
        }
    }

    indices.length = numColumns * numRows * 6;
    let idx = 0;

    for (let c = 0; c < numColumns; c++)
    {
        for (let r = 0; r < numRows; r++)
        {
            const ind = c + (numColumns + 1) * r;
            const v1 = ind;
            const v2 = ind + 1;
            const v3 = ind + numColumns + 1;
            const v4 = ind + 1 + numColumns + 1;

            if (curAxis == AXIS_XY) // default
            {
                indices[idx++] = v1;
                indices[idx++] = v2;
                indices[idx++] = v3;

                indices[idx++] = v3;
                indices[idx++] = v2;
                indices[idx++] = v4;
            }
            else
            if (curAxis == AXIS_XZ)
            {
                indices[idx++] = v1;
                indices[idx++] = v3;
                indices[idx++] = v2;

                indices[idx++] = v2;
                indices[idx++] = v3;
                indices[idx++] = v4;
            }
        }
    }

    if (flipTcY.get()) for (let i = 0; i < tc.length; i += 2)tc[i + 1] = 1.0 - tc[i + 1];
    if (flipTcX.get()) for (let i = 0; i < tc.length; i += 2)tc[i] = 1.0 - tc[i];

    geom.clear();
    geom.vertices = verts;
    geom.texCoords = tc;
    geom.verticesIndices = indices;
    geom.vertexNormals = norms;
    geom.tangents = tangents;
    geom.biTangents = biTangents;

    if (op.patch.cg)
        if (!mesh) mesh = op.patch.cg.createMesh(geom, { "opId": op.id });
        else mesh.setGeom(geom);

    geomOut.setRef(geom);
    needsRebuild = false;
}

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.Shadow_v2
// 
// **************************************************************

Ops.Gl.ShaderEffects.Shadow_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"head_frag":"#define CAST_SHADOW y\n\n#define NEAR x\n#define FAR y\n#define MAP_SIZE z\n#define BIAS w\n\n#ifdef WEBGL2\n    #define textureCube texture\n#endif\n\nfloat MOD_when_gt(float x, float y) { return max(sign(x - y), 0.0); } // comparator function\nfloat MOD_when_eq(float x, float y) { return 1. - abs(sign(x - y)); } // comparator function\nfloat MOD_when_neq(float x, float y) { return abs(sign(x - y)); } // comparator function\n\n#ifdef MODE_VSM\n    float MOD_linstep(float value, float low, float high) {\n        return clamp((value - low)/(high-low), 0., 1.);\n    }\n#endif\n\n\n\n\n\n#ifdef MODE_DEFAULT\n    float MOD_ShadowFactorDefault(float shadowMapSample, float shadowMapDepth, float bias, float shadowStrength) {\n        return step(shadowMapDepth - bias, shadowMapSample);\n    }\n#endif\n\n#ifdef MODE_PCF\n\n    #ifdef WEBGL2\n        vec3 MOD_offsets[20] = vec3[]\n        (\n           vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1),\n           vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),\n           vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),\n           vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),\n           vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)\n        );\n    #endif\n    #ifdef WEBGL1\n        vec3 MOD_offsets[20];\n        int MOD_CALLED_FILL_PCF_ARRAY = 0;\n        void MOD_FillPCFArray() {\n            if (MOD_CALLED_FILL_PCF_ARRAY == 1) return;\n            MOD_offsets[0] = vec3( 1,  1,  1);\n            MOD_offsets[1] = vec3( 1, -1,  1);\n            MOD_offsets[2] = vec3(-1, -1,  1);\n            MOD_offsets[3] = vec3(-1,  1,  1);\n            MOD_offsets[4] = vec3( 1,  1, -1);\n            MOD_offsets[5] = vec3( 1, -1, -1);\n            MOD_offsets[6] = vec3(-1, -1, -1);\n            MOD_offsets[7] = vec3(-1,  1, -1);\n            MOD_offsets[8] = vec3( 1,  1,  0);\n            MOD_offsets[9] = vec3( 1, -1,  0);\n            MOD_offsets[10] = vec3(-1, -1,  0);\n            MOD_offsets[11] = vec3(-1,  1,  0);\n            MOD_offsets[12] = vec3( 1,  0,  1);\n            MOD_offsets[13] = vec3(-1,  0,  1);\n            MOD_offsets[14] = vec3( 1,  0, -1);\n            MOD_offsets[15] = vec3(-1,  0, -1);\n            MOD_offsets[16] = vec3( 0,  1,  1);\n            MOD_offsets[17] = vec3( 0, -1,  1);\n            MOD_offsets[18] = vec3( 0, -1, -1);\n            MOD_offsets[19] = vec3( 0,  1, -1);\n            MOD_CALLED_FILL_PCF_ARRAY = 1;\n        }\n    #endif\n    // float diskRadius = 0.05;\n    #define RIGHT_BOUND float((SAMPLE_AMOUNT-1.)/2.)\n    #define LEFT_BOUND -RIGHT_BOUND\n    #define PCF_DIVISOR float(SAMPLE_AMOUNT*SAMPLE_AMOUNT)\n\n    #define SAMPLE_AMOUNT_POINT int(SAMPLE_AMOUNT * 2. + 4.)\n    // https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows\n    float MOD_ShadowFactorPointPCF(\n        samplerCube shadowMap,\n        vec3 lightDirection,\n        float shadowMapDepth,\n        float nearPlane,\n        float farPlane,\n        float bias,\n        float shadowStrength,\n        vec3 modelPos,\n        vec3 camPos,\n        float sampleSpread\n    ) {\n        #ifdef WEBGL1\n            MOD_FillPCFArray();\n        #endif\n\n        float visibility  = 0.0;\n        float viewDistance = length(camPos - modelPos.xyz);\n        float diskRadius = (1.0 + ((viewDistance) / (farPlane - nearPlane))) / sampleSpread;\n\n        for (int i = 0; i < SAMPLE_AMOUNT_POINT; i++) {\n            float shadowMapSample = textureCube(shadowMap, -lightDirection + MOD_offsets[i] * diskRadius).r;\n            visibility += step(shadowMapDepth - bias, shadowMapSample);\n        }\n        visibility /= float(SAMPLE_AMOUNT_POINT);\n        return clamp(visibility, 0., 1.);\n    }\n\n    float MOD_ShadowFactorPCF(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapSize, float shadowMapDepth, float bias, float shadowStrength) {\n        float texelSize = 1. / shadowMapSize;\n        float visibility = 0.;\n\n        // sample neighbouring pixels & get mean value\n        for (float x = LEFT_BOUND; x <= RIGHT_BOUND; x += 1.0) {\n            for (float y = LEFT_BOUND; y <= RIGHT_BOUND; y += 1.0) {\n                float texelDepth = texture(shadowMap, shadowMapLookup + vec2(x, y) * texelSize).r;\n                visibility += step(shadowMapDepth - bias, texelDepth);\n            }\n        }\n\n        return clamp(visibility / PCF_DIVISOR, 0., 1.);\n    }\n#endif\n\n\n#ifdef MODE_POISSON\n    #ifdef WEBGL2\n        vec2 MOD_poissonDisk[16] = vec2[16](\n        vec2( -0.94201624, -0.39906216 ),\n        vec2( 0.94558609, -0.76890725 ),\n        vec2( -0.094184101, -0.92938870 ),\n        vec2( 0.34495938, 0.29387760 ),\n        vec2( -0.91588581, 0.45771432 ),\n        vec2( -0.81544232, -0.87912464 ),\n        vec2( -0.38277543, 0.27676845 ),\n        vec2( 0.97484398, 0.75648379 ),\n        vec2( 0.44323325, -0.97511554 ),\n        vec2( 0.53742981, -0.47373420 ),\n        vec2( -0.26496911, -0.41893023 ),\n        vec2( 0.79197514, 0.19090188 ),\n        vec2( -0.24188840, 0.99706507 ),\n        vec2( -0.81409955, 0.91437590 ),\n        vec2( 0.19984126, 0.78641367 ),\n        vec2( 0.14383161, -0.14100790 )\n        );\n    #endif\n    #ifdef WEBGL1\n    int MOD_CALLED_FILL_POISSON_ARRAY = 0;\n    // cannot allocate arrays like above in webgl1\n        vec2 MOD_poissonDisk[16];\n        void FillPoissonArray() {\n            if (MOD_CALLED_FILL_POISSON_ARRAY == 1) return;\n            MOD_poissonDisk[0] = vec2( -0.94201624, -0.39906216 );\n            MOD_poissonDisk[1] = vec2( 0.94558609, -0.76890725 );\n            MOD_poissonDisk[2] = vec2( -0.094184101, -0.92938870 );\n            MOD_poissonDisk[3] = vec2( 0.34495938, 0.29387760 );\n            MOD_poissonDisk[4] = vec2( -0.91588581, 0.45771432 );\n            MOD_poissonDisk[5] = vec2( -0.81544232, -0.87912464 );\n            MOD_poissonDisk[6] = vec2( -0.38277543, 0.27676845 );\n            MOD_poissonDisk[7] = vec2( 0.97484398, 0.75648379 );\n            MOD_poissonDisk[8] = vec2( 0.44323325, -0.97511554 );\n            MOD_poissonDisk[9] = vec2( 0.53742981, -0.47373420 );\n            MOD_poissonDisk[10] = vec2( -0.26496911, -0.41893023 );\n            MOD_poissonDisk[11] = vec2( 0.79197514, 0.19090188 );\n            MOD_poissonDisk[12] = vec2( -0.24188840, 0.99706507 );\n            MOD_poissonDisk[13] = vec2( -0.81409955, 0.91437590 );\n            MOD_poissonDisk[14] = vec2( 0.19984126, 0.78641367 );\n            MOD_poissonDisk[15] = vec2( 0.14383161, -0.14100790);\n            MOD_CALLED_FILL_POISSON_ARRAY = 1;\n        }\n    #endif\n#define SAMPLE_AMOUNT_INT int(SAMPLE_AMOUNT)\n#define INV_SAMPLE_AMOUNT 1./SAMPLE_AMOUNT\n    float MOD_ShadowFactorPointPoisson(samplerCube shadowCubeMap, vec3 lightDirection, float shadowMapDepth, float bias, float sampleSpread) {\n        float visibility = 1.;\n\n        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {\n            visibility -= INV_SAMPLE_AMOUNT * step(textureCube(shadowCubeMap, (-lightDirection + MOD_poissonDisk[i].xyx/sampleSpread)).r, shadowMapDepth - bias);\n        }\n\n        return clamp(visibility, 0., 1.);\n    }\n\n    float MOD_ShadowFactorPoisson(sampler2D shadowMap, vec2 shadowMapLookup, float shadowMapDepth, float bias, float sampleSpread) {\n        float visibility = 1.;\n\n        for (int i = 0; i < SAMPLE_AMOUNT_INT; i++) {\n            visibility -= INV_SAMPLE_AMOUNT * step(texture(shadowMap, (shadowMapLookup + MOD_poissonDisk[i]/sampleSpread)).r, shadowMapDepth - bias);\n        }\n\n        return clamp(visibility, 0., 1.);\n    }\n#endif\n\n#ifdef MODE_VSM\n    float MOD_ShadowFactorVSM(vec2 moments, float shadowBias, float shadowMapDepth, float shadowStrength) {\n\n            float depthScale = shadowBias * 0.01 * shadowMapDepth; // - shadowBias;\n            float minVariance = depthScale*depthScale; // = 0.00001\n\n            float distanceTo = shadowMapDepth; //shadowMapDepth; // - shadowBias;\n\n                // retrieve previously stored moments & variance\n            float p = step(distanceTo, moments.x);\n            float variance =  max(moments.y - (moments.x * moments.x), 0.00001);\n\n            float distanceToMean = distanceTo - moments.x;\n\n            //there is a very small probability that something is being lit when its not\n            // little hack: clamp pMax 0.2 - 1. then subtract - 0,2\n            // bottom line helps make the shadows darker\n            // float pMax = linstep((variance - bias) / (variance - bias + (distanceToMean * distanceToMean)), 0.0001, 1.);\n            float pMax = MOD_linstep((variance) / (variance + (distanceToMean * distanceToMean)), shadowBias, 1.);\n            //float pMax = clamp(variance / (variance + distanceToMean*distanceToMean), 0.2, 1.) - 0.2;\n            //pMax = variance / (variance + distanceToMean*distanceToMean);\n            // visibility = clamp(pMax, 1., p);\n            float visibility = min(max(p, pMax), 1.);\n\n            return visibility;\n    }\n#endif\n","shadow_body_directional_frag":"\n// FRAGMENT BODY type: DIRECTIONAL count: {{LIGHT_INDEX}}\n#ifdef RECEIVE_SHADOW\n    #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n            if (MOD_light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {\n                vec2 shadowMapLookup{{LIGHT_INDEX}} = MOD_shadowCoord{{LIGHT_INDEX}}.xy / MOD_shadowCoord{{LIGHT_INDEX}}.w;\n                float shadowMapDepth{{LIGHT_INDEX}} = MOD_shadowCoord{{LIGHT_INDEX}}.z  / MOD_shadowCoord{{LIGHT_INDEX}}.w;\n                float shadowStrength{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowStrength;\n                vec2 shadowMapSample{{LIGHT_INDEX}} = texture(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}).rg;\n                float bias{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS;\n\n                #ifdef MODE_DEFAULT\n                    float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                    MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                    vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                    col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                #endif\n\n                #ifdef MODE_PCF\n                    float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPCF(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.MAP_SIZE, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                    MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                    vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                    col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                #endif\n\n                #ifdef MODE_POISSON\n                    #ifdef WEBGL1\n                        FillPoissonArray();\n                    #endif\n\n                    float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPoisson(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, MOD_sampleSpread);\n                    MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                    vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                    col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                #endif\n\n                #ifdef MODE_VSM\n                    float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                    MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                    vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                    col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                #endif\n            }\n    #endif\n#endif","shadow_body_directional_vert":"// VERTEX BODY type: DIRECTIONAL count: {{LIGHT_INDEX}}\n#ifdef RECEIVE_SHADOW\n    #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n        MOD_modelPos{{LIGHT_INDEX}} = mMatrix*pos;\n        MOD_shadowCoord{{LIGHT_INDEX}} = MOD_lightMatrix{{LIGHT_INDEX}} * (MOD_modelPos{{LIGHT_INDEX}} + vec4(norm, 1) * MOD_normalOffset{{LIGHT_INDEX}});\n    #endif\n#endif\n","shadow_body_point_frag":"// FRAGMENT BODY type: POINT count: {{LIGHT_INDEX}}\n #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n        if (MOD_light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {\n            vec3 lightDirectionMOD{{LIGHT_INDEX}} = normalize(MOD_light{{LIGHT_INDEX}}.position - MOD_modelPos{{LIGHT_INDEX}}.xyz);\n            float shadowStrength{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowStrength;\n\n            float cameraNear{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowProperties.NEAR; // uniforms\n            float cameraFar{{LIGHT_INDEX}} =  MOD_light{{LIGHT_INDEX}}.shadowProperties.FAR;\n\n            float fromLightToFrag{{LIGHT_INDEX}} = (length(MOD_modelPos{{LIGHT_INDEX}}.xyz - MOD_light{{LIGHT_INDEX}}.position) - cameraNear{{LIGHT_INDEX}}) / (cameraFar{{LIGHT_INDEX}} - cameraNear{{LIGHT_INDEX}});\n\n            float shadowMapDepth{{LIGHT_INDEX}} = fromLightToFrag{{LIGHT_INDEX}};\n            // float bias{{LIGHT_INDEX}} = clamp(MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, 0., 1.);\n            float lambert{{LIGHT_INDEX}} = clamp(dot(lightDirectionMOD{{LIGHT_INDEX}}, normalize(MOD_normal{{LIGHT_INDEX}})), 0., 1.);\n            float bias{{LIGHT_INDEX}} = clamp(MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS * tan(acos(lambert{{LIGHT_INDEX}})), 0., 0.1);\n            vec2 shadowMapSample{{LIGHT_INDEX}} = textureCube(MOD_shadowMapCube{{LIGHT_INDEX}}, -lightDirectionMOD{{LIGHT_INDEX}}).rg;\n\n\n\n\n            #ifdef MODE_DEFAULT\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n            #ifdef MODE_PCF\n                 float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPointPCF(\n                    MOD_shadowMapCube{{LIGHT_INDEX}},\n                    lightDirectionMOD{{LIGHT_INDEX}},\n                    shadowMapDepth{{LIGHT_INDEX}},\n                    cameraNear{{LIGHT_INDEX}},\n                    cameraFar{{LIGHT_INDEX}},\n                    bias{{LIGHT_INDEX}},\n                    shadowStrength{{LIGHT_INDEX}},\n                    MOD_modelPos{{LIGHT_INDEX}}.xyz,\n                    MOD_camPos,\n                    MOD_sampleSpread\n                );\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n            #ifdef MODE_POISSON\n                #ifdef WEBGL1\n                    FillPoissonArray();\n                #endif\n\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPointPoisson(MOD_shadowMapCube{{LIGHT_INDEX}}, lightDirectionMOD{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, MOD_sampleSpread);\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n\n            #ifdef MODE_VSM\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n        }\n#endif\n","shadow_body_point_vert":"// VERTEX BODY type: POINT count: {{LIGHT_INDEX}}\n#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n    MOD_modelPos{{LIGHT_INDEX}} = mMatrix * pos;\n    MOD_normal{{LIGHT_INDEX}} = norm;\n#endif\n","shadow_body_spot_frag":"// FRAGMENT BODY type: SPOT count: {{LIGHT_INDEX}}\n #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n        if (MOD_light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {\n            vec3 lightDirectionMOD{{LIGHT_INDEX}} = normalize(MOD_light{{LIGHT_INDEX}}.position - MOD_modelPos{{LIGHT_INDEX}}.xyz);\n            vec2 shadowMapLookup{{LIGHT_INDEX}} = MOD_shadowCoord{{LIGHT_INDEX}}.xy / MOD_shadowCoord{{LIGHT_INDEX}}.w;\n            float shadowMapDepth{{LIGHT_INDEX}} = MOD_shadowCoord{{LIGHT_INDEX}}.z  / MOD_shadowCoord{{LIGHT_INDEX}}.w;\n            float shadowStrength{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowStrength;\n            vec2 shadowMapSample{{LIGHT_INDEX}} = texture(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}).rg;\n            float lambert{{LIGHT_INDEX}} = clamp(dot(lightDirectionMOD{{LIGHT_INDEX}}, normalize(MOD_normal{{LIGHT_INDEX}})), 0., 1.);\n            float bias{{LIGHT_INDEX}} = clamp(MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS * tan(acos(lambert{{LIGHT_INDEX}})), 0., 0.1);\n\n            #ifdef MODE_DEFAULT\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n\n            #ifdef MODE_PCF\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPCF(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.MAP_SIZE, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n\n            #ifdef MODE_POISSON\n                #ifdef WEBGL1\n                    FillPoissonArray();\n                #endif\n\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPoisson(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, MOD_sampleSpread);\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n\n            #ifdef MODE_VSM\n                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});\n                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);\n                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);\n            #endif\n        }\n    #endif\n","shadow_body_spot_vert":"// VERTEX BODY type: SPOT count: {{LIGHT_INDEX}}\n#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n    MOD_modelPos{{LIGHT_INDEX}} = mMatrix*pos;\n    MOD_shadowCoord{{LIGHT_INDEX}} = MOD_lightMatrix{{LIGHT_INDEX}} * (MOD_modelPos{{LIGHT_INDEX}} + vec4(norm, 1) * MOD_normalOffset{{LIGHT_INDEX}});\n    MOD_normal{{LIGHT_INDEX}} = norm;\n#endif\n","shadow_head_directional_frag":"// FRAGMENT HEAD type: SPOT count: {{LIGHT_INDEX}}\n\n#ifdef RECEIVE_SHADOW\n    #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n        IN vec4 MOD_modelPos{{LIGHT_INDEX}};\n        IN vec4 MOD_shadowCoord{{LIGHT_INDEX}};\n    #endif\n#endif\n","shadow_head_directional_vert":"// VERTEX HEAD type: DIRECTIONAL count: {{LIGHT_INDEX}}\n#ifdef RECEIVE_SHADOW\n    #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n        OUT vec4 MOD_modelPos{{LIGHT_INDEX}};\n        OUT vec4 MOD_shadowCoord{{LIGHT_INDEX}};\n    #endif\n#endif\n","shadow_head_point_frag":"// FRAGMENT HEAD type: POINT count: {{LIGHT_INDEX}}\n#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n    IN vec4 MOD_modelPos{{LIGHT_INDEX}};\n    IN vec3 MOD_normal{{LIGHT_INDEX}};\n#endif\n","shadow_head_point_vert":"// VERTEX HEAD type: POINT count: {{LIGHT_INDEX}}\n#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n    OUT vec4 MOD_modelPos{{LIGHT_INDEX}};\n    OUT vec3 MOD_normal{{LIGHT_INDEX}};\n#endif\n","shadow_head_spot_frag":"// FRAGMENT HEAD type: SPOT count: {{LIGHT_INDEX}}\nIN vec4 MOD_modelPos{{LIGHT_INDEX}};\nIN vec3 MOD_normal{{LIGHT_INDEX}};\n\n#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n    IN vec4 MOD_shadowCoord{{LIGHT_INDEX}};\n#endif\n","shadow_head_spot_vert":"// VERTEX HEAD type: SPOT count: {{LIGHT_INDEX}}\n#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}\n    OUT vec4 MOD_modelPos{{LIGHT_INDEX}};\n    OUT vec3 MOD_normal{{LIGHT_INDEX}};\n    OUT vec4 MOD_shadowCoord{{LIGHT_INDEX}};\n#endif\n",};
const cgl = op.patch.cgl;
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");
const LIGHT_TYPES = { "point": 0, "directional": 1, "spot": 2 };

function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const inTrigger = op.inTrigger("Trigger In");
const inCastShadow = op.inBool("Cast Shadow", true);
const inReceiveShadow = op.inBool("Receive Shadow", true);
const algorithms = ["Default", "PCF", "Poisson", "VSM"];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, "Default");
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);
const inSpread = op.inInt("Sample Distribution", 250);

const inShadowColorR = op.inFloatSlider("R", 0);
const inShadowColorG = op.inFloatSlider("G", 0);
const inShadowColorB = op.inFloatSlider("B", 0);
inShadowColorR.setUiAttribs({ "colorPick": true });
const inDiscardTransparent = op.inBool("Discard Transparent", false);
const inOpacityThreshold = op.inFloatSlider("Opacity Threshold", 0.5);
const ALPHA_MASK_SOURCE = ["Luminance", "R", "G", "B", "A"];
const inAlphaMaskSource = op.inSwitch("Alpha Mask Source", ALPHA_MASK_SOURCE, "Luminance");
const inOpacityTexture = op.inTexture("Opacity Texture");

inOpacityThreshold.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
inAlphaMaskSource.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
inSamples.setUiAttribs({ "greyout": true });
inSpread.setUiAttribs({ "greyout": true });
op.setPortGroup("", [inCastShadow, inReceiveShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inSpread, inShadowColorR, inShadowColorG, inShadowColorB]);
op.setPortGroup("", [inDiscardTransparent]);
op.setPortGroup("Opacity Settings", [inOpacityThreshold, inAlphaMaskSource, inOpacityTexture]);

if (inReceiveShadow.get())
{
    if (inAlgorithm.get() === "PCF" || inAlgorithm.get() === "Poisson")
    {
        inSamples.setUiAttribs({ "greyout": false });
        inSpread.setUiAttribs({ "greyout": false });
    }
    else if (inAlgorithm.get() === "VSM" || inAlgorithm.get() === "Default")
    {
        inSamples.setUiAttribs({ "greyout": true });
        inSpread.setUiAttribs({ "greyout": true });
    }
}

inDiscardTransparent.onChange = () =>
{
    inOpacityThreshold.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
    inAlphaMaskSource.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
};

inAlphaMaskSource.onChange = () =>
{
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_LUMINANCE", inAlphaMaskSource.get() === "Luminance");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_R", inAlphaMaskSource.get() === "R");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_G", inAlphaMaskSource.get() === "G");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_B", inAlphaMaskSource.get() === "B");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_A", inAlphaMaskSource.get() === "A");
};

inReceiveShadow.onChange = () =>
{
    inAlgorithm.setUiAttribs({ "greyout": !inReceiveShadow.get() });
    setAlgorithmGreyouts();
};

inAlgorithm.onChange = () =>
{
    const current = inAlgorithm.get();
    algorithms.forEach((alg) => { return shaderModule.toggleDefine("MODE_" + alg.toUpperCase(), alg === current); });

    setAlgorithmGreyouts();
};

function setAlgorithmGreyouts()
{
    if (!inReceiveShadow.get())
    {
        inSamples.setUiAttribs({ "greyout": true });
        inSpread.setUiAttribs({ "greyout": true });
        return;
    }

    if (inAlgorithm.get() === "PCF" || inAlgorithm.get() === "Poisson")
    {
        inSamples.setUiAttribs({ "greyout": false });
        inSpread.setUiAttribs({ "greyout": false });
    }
    else
    {
        inSamples.setUiAttribs({ "greyout": true });
        inSpread.setUiAttribs({ "greyout": true });
    }
}

inSamples.onChange = () =>
{
    shaderModule.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
};

const outTrigger = op.outTrigger("Trigger Out");

const createVertexHead = (n, type) =>
{
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_head_point_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_head_spot_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_head_directional_vert.replace(LIGHT_INDEX_REGEX, n);
};

const createVertexBody = (n, type) =>
{
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_body_point_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_body_spot_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_body_directional_vert.replace(LIGHT_INDEX_REGEX, n);
};

const createFragmentHead = (n, type) =>
{
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_head_point_frag.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_head_spot_frag.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_head_directional_frag.replace(LIGHT_INDEX_REGEX, n);
};

const createFragmentBody = (n, type) =>
{
    if (type === "ambient") return "";
    let fragmentCode = "";
    if (type === "spot")
    {
        fragmentCode = fragmentCode.concat(attachments.shadow_body_spot_frag.replace(LIGHT_INDEX_REGEX, n));
    }
    else if (type === "directional")
    {
        fragmentCode = fragmentCode.concat(attachments.shadow_body_directional_frag.replace(LIGHT_INDEX_REGEX, n));
    }
    else if (type === "point")
    {
        fragmentCode = fragmentCode.concat(attachments.shadow_body_point_frag.replace(LIGHT_INDEX_REGEX, n));
    }

    return fragmentCode;
};

const STATE = {
    "lastLength": 0,
    "updating": false
};

function renderShadowPassWithModule()
{
    if (inDiscardTransparent.get())
    {
        if (inOpacityTexture.get())
        {
            if (!shadowShaderModule.hasUniform("MOD_texOpacity"))
            {
                shadowShaderModule.addUniformFrag("t", "MOD_texOpacity", 0);
            }

            if (!shadowShaderModule.hasDefine("MOD_HAS_TEXTURE_OPACITY")) shadowShaderModule.define("MOD_HAS_TEXTURE_OPACITY", "");
            shadowShaderModule.pushTexture("MOD_texOpacity", inOpacityTexture.get().tex);
        }
        else
        {
            if (shadowShaderModule.hasUniform("MOD_texOpacity"))
                shadowShaderModule.removeUniform("MOD_texOpacity");

            if (shadowShaderModule.hasDefine("MOD_HAS_TEXTURE_OPACITY")) shadowShaderModule.removeDefine("MOD_HAS_TEXTURE_OPACITY");
        }

        shadowShaderModule.bind();
        outTrigger.trigger();
        shadowShaderModule.unbind();
    }
    else
    {
        outTrigger.trigger();
    }
}

function createModuleShaders()
{
    STATE.updating = true;
    removeUniforms();

    let vertexHead = "";
    let fragmentHead = "";
    let vertexBody = "";
    let fragmentBody = "";

    for (let i = 0; i < cgl.tempData.lightStack.length; i += 1)
    {
        const light = cgl.tempData.lightStack[i];
        vertexHead = vertexHead.concat(createVertexHead(i, light.type));
        vertexBody = vertexBody.concat(createVertexBody(i, light.type));

        fragmentHead = fragmentHead.concat(createFragmentHead(i, light.type));
        fragmentBody = fragmentBody.concat(createFragmentBody(i, light.type, light.castShadow));
    }

    srcHeadVert = srcHeadVertBase.concat(vertexHead);
    srcBodyVert = srcBodyVertBase.concat(vertexBody);
    srcHeadFrag = srcHeadFragBase.concat(fragmentHead);
    srcBodyFrag = srcBodyFragBase.concat(fragmentBody);

    shaderModule.removeModule(op.objName);

    shaderModule.addModule({
        "name": "MODULE_VERTEX_POSITION",
        "title": op.objName,
        // "priority": -2,
        "srcHeadVert": srcHeadVert,
        "srcBodyVert": srcBodyVert
    });

    shaderModule.addModule({
        "name": "MODULE_COLOR",
        // "priority": -2,
        "title": op.objName,
        "srcHeadFrag": srcHeadFrag,
        "srcBodyFrag": srcBodyFrag,
    });

    createUniforms();
}

// * SHADOW PASS MODULE *
const shadowShaderModule = new CGL.ShaderModifier(cgl, "shadowPassModifier_" + op.id);
shadowShaderModule.addModule({
    "name": "MODULE_COLOR",
    // "priority": -2,
    "title": op.objName + "shadowPass",
    "srcHeadFrag": "",
    "srcBodyFrag": `
    #ifdef MOD_HAS_TEXTURE_OPACITY
        #ifdef MOD_ALPHA_MASK_LUMINANCE
            outColor.a *= dot(vec3(0.2126,0.7152,0.0722), texture(MOD_texOpacity, texCoord).rgb);
        #endif
        #ifdef MOD_ALPHA_MASK_R
            outColor.a *= texture(MOD_texOpacity, texCoord).r;
        #endif
        #ifdef MOD_ALPHA_MASK_G
            outColor.a *= texture(MOD_texOpacity, texCoord).g;
        #endif
        #ifdef MOD_ALPHA_MASK_B
            outColor.a *= texture(MOD_texOpacity, texCoord).b;
        #endif
        #ifdef MOD_ALPHA_MASK_A
            outColor.a *= texture(MOD_texOpacity, texCoord).a;
        #endif
        if (outColor.a < MOD_inOpacityThreshold) discard;
    #endif
    `
});

shadowShaderModule.addUniformFrag("f", "MOD_inOpacityThreshold", inOpacityThreshold);

shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_LUMINANCE", inAlphaMaskSource.get() === "Luminance");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_R", inAlphaMaskSource.get() === "R");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_G", inAlphaMaskSource.get() === "G");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_B", inAlphaMaskSource.get() === "B");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_A", inAlphaMaskSource.get() === "A");

const srcHeadVertBase = "";
const srcBodyVertBase = "";
const srcHeadFragBase = attachments.head_frag;
const srcBodyFragBase = "";

let srcHeadVert = srcHeadVertBase;
let srcBodyVert = srcBodyVertBase;
let srcHeadFrag = srcHeadFragBase;
let srcBodyFrag = srcBodyFragBase;

// * MAIN PASS MODULE *
const shaderModule = new CGL.ShaderModifier(cgl, "shadowModule_" + op.id);
shaderModule.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
shaderModule.toggleDefine("RECEIVE_SHADOW", inReceiveShadow);

algorithms.forEach((alg) => { return shaderModule.toggleDefine("MODE_" + alg.toUpperCase(), alg === inAlgorithm.get()); });

const hasShadowMap = [];
const hasShadowCubemap = [];

function removeUniforms()
{
    for (let i = 0; i < STATE.lastLength; i += 1)
    {
        shaderModule.removeUniformStruct("MOD_light" + i);
        shaderModule.removeUniform("MOD_shadowMap" + i);
        shaderModule.removeUniform("MOD_shadowMapCube" + i);
        shaderModule.removeUniform("MOD_normalOffset" + i);
        shaderModule.removeUniform("MOD_lightMatrix" + i);
        shaderModule.removeDefine("HAS_SHADOW_MAP_" + i);
    }

    if (STATE.lastLength > 0)
    {
        shaderModule.removeUniform("MOD_sampleSpread");
        shaderModule.removeUniform("MOD_camPos");
    }
    hasShadowMap.length = 0;
    hasShadowCubemap.length = 0;
}

function createUniforms()
{
    for (let i = 0; i < cgl.tempData.lightStack.length; i += 1)
    {
        const light = cgl.tempData.lightStack[i];

        shaderModule.addUniformStructFrag("MOD_Light", "MOD_light" + i, [
            { "type": "3f", "name": "position", "v1": null },
            { "type": "2i", "name": "typeCastShadow", "v1": null },
            { "type": "4f", "name": "shadowProperties", "v1": [light.nearFar[0], light.nearFar[1], 512, light.shadowBias] },
            { "type": "f", "name": "shadowStrength", "v1": light.shadowStrength },
        ]);

        hasShadowMap[i] = false;
        hasShadowCubemap[i] = false;

        if (light.type !== "point")
        {
            shaderModule.addUniformVert("m4", "MOD_lightMatrix" + i, mat4.create(), null, null, null);
            shaderModule.addUniformVert("f", "MOD_normalOffset" + i, 0, null, null, null, null);
            shaderModule.addUniformFrag("t", "MOD_shadowMap" + i, 0, null, null, null);
        }
        else shaderModule.addUniformFrag("tc", "MOD_shadowMapCube" + i, 0, null, null, null);
    }

    if (cgl.tempData.lightStack.length > 0)
    {
        shaderModule.addUniformFrag("3f", "MOD_shadowColor", inShadowColorR, inShadowColorG, inShadowColorB, null);
        shaderModule.addUniformFrag("f", "MOD_sampleSpread", inSpread, null, null, null);
        if (cgl.tempData.lightStack.map((l) => { return l.type; }).indexOf("point") !== -1) shaderModule.addUniformFrag("3f", "MOD_camPos", [0, 0, 0], null, null, null);
    }

    STATE.lastLength = cgl.tempData.lightStack.length;
    STATE.updating = false;
}

function setUniforms()
{
    if (STATE.updating) return;
    const receiveShadow = inReceiveShadow.get();

    for (let i = 0; i < cgl.tempData.lightStack.length; i += 1)
    {
        const light = cgl.tempData.lightStack[i];

        if (light.type === "ambient") continue;

        if (!light.isUsed) light.isUsed = true;

        if (light.type !== "point") shaderModule.setUniformValue("MOD_light" + i + ".position", light.position);
        else
        {
            shaderModule.setUniformValue("MOD_light" + i + ".position", light.positionForShadowMap);
        }
        shaderModule.setUniformValue("MOD_light" + i + ".typeCastShadow", [
            LIGHT_TYPES[light.type],
            Number(light.castShadow),
        ]);

        shaderModule.setUniformValue("MOD_light" + i + ".shadowStrength", light.shadowStrength);

        if (light.shadowMap)
        {
            if (!hasShadowMap[i])
            {
                hasShadowMap[i] = true;
                hasShadowCubemap[i] = false;
            }
            if (!shaderModule.hasDefine("HAS_SHADOW_MAP_" + i))
            {
                shaderModule.define("HAS_SHADOW_MAP_" + i, true);
            }

            if (light.type !== "point")
            {
                shaderModule.setUniformValue("MOD_lightMatrix" + i, light.lightMatrix);
                shaderModule.setUniformValue("MOD_normalOffset" + i, light.normalOffset);
            }

            shaderModule.setUniformValue("MOD_light" + i + ".shadowProperties", [
                light.nearFar[0],
                light.nearFar[1],
                light.shadowMap.width,
                light.shadowBias
            ]);

            if (light.type === "point") shaderModule.setUniformValue("MOD_camPos", [_tempCamPosMatrix[12], _tempCamPosMatrix[13], _tempCamPosMatrix[14]]);

            if (hasShadowMap[i])
            {
                if (light.shadowMap.tex) shaderModule.pushTexture("MOD_shadowMap" + i, light.shadowMap.tex);
            }
            continue;
        }

        if (light.shadowCubeMap)
        {
            if (!hasShadowCubemap[i])
            {
                hasShadowCubemap[i] = true;
                hasShadowMap[i] = false;
            }

            if (!shaderModule.hasDefine("HAS_SHADOW_MAP_" + i)) shaderModule.define("HAS_SHADOW_MAP_" + i, "");

            shaderModule.setUniformValue("MOD_light" + i + ".shadowProperties", [
                light.nearFar[0],
                light.nearFar[1],
                light.shadowCubeMap.size,
                light.shadowBias
            ]);

            if (hasShadowCubemap[i])
            {
                if (light.shadowCubeMap.cubemap) shaderModule.pushTexture("MOD_shadowMapCube" + i, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
            }
            continue;
        }

        else
        {
            if (hasShadowMap[i])
            {
                if (shaderModule.hasDefine("HAS_SHADOW_MAP_" + i))
                {
                    shaderModule.removeDefine("HAS_SHADOW_MAP_" + i);
                }
                hasShadowMap[i] = false;
            }
            else if (hasShadowCubemap[i])
            {
                if (shaderModule.hasDefine("HAS_SHADOW_MAP_" + i)) shaderModule.removeDefine("HAS_SHADOW_MAP_" + i);
                hasShadowCubemap[i] = false;
            }
            continue;
        }
    }
}

function updateShader()
{
    if (cgl.tempData.lightStack.length !== STATE.lastLength)
        createModuleShaders();

    setUniforms();
}

inTrigger.onLinkChanged = function ()
{
    if (!inTrigger.isLinked()) STATE.lastLength = 0;
    hasShadowMap.length = 0;
    hasShadowCubemap.length = 0;
};
outTrigger.onLinkChanged = function ()
{
    if (!outTrigger.isLinked()) STATE.lastLength = 0;
    hasShadowMap.length = 0;
    hasShadowCubemap.length = 0;
};

const _tempCamPosMatrix = mat4.create();

inTrigger.onTriggered = () =>
{
    if (STATE.updating)
    {
        outTrigger.trigger();
        return;
    }

    if (cgl.tempData.shadowPass)
    {
        if (!inCastShadow.get()) return;
        renderShadowPassWithModule();
        return;
    }

    if (!inReceiveShadow.get())
    {
        outTrigger.trigger();
        return;
    }

    checkUiErrors();

    mat4.invert(_tempCamPosMatrix, cgl.vMatrix);

    if (cgl.tempData.lightStack)
    {
        if (cgl.tempData.lightStack.length)
        {
            updateShader();

            shaderModule.bind();
            outTrigger.trigger();
            shaderModule.unbind();
        }
        else
        {
            outTrigger.trigger();
            STATE.lastLength = 0;
            hasShadowMap.length = 0;
            hasShadowCubemap.length = 0;
        }
    }
    else
    {
        outTrigger.trigger();
    }
};

function checkUiErrors()
{
    if (cgl.tempData.lightStack)
    {
        if (cgl.tempData.lightStack.length === 0)
        {
            op.setUiError("nolights", "There are no lights in the patch. Please add lights before this op and activate their \"Cast Shadow\" property to be able to use shadows.", 1);
        }
        else
        {
            op.setUiError("nolights", null);

            let oneLightCastsShadow = false;
            let allLightsBlurAboveZero = true;

            for (let i = 0; i < cgl.tempData.lightStack.length; i += 1)
            {
                oneLightCastsShadow = oneLightCastsShadow || cgl.tempData.lightStack[i].castShadow;

                if (cgl.tempData.lightStack[i].castShadow && cgl.tempData.lightStack[i].type !== "point")
                    allLightsBlurAboveZero = allLightsBlurAboveZero && (cgl.tempData.lightStack[i].blurAmount > 0);
            }

            if (oneLightCastsShadow)
            {
                op.setUiError("nolights2", null);
                if (inReceiveShadow.get())
                {
                    op.setUiError("inReceiveShadowActive", null);
                }
                else
                {
                    op.setUiError("inReceiveShadowActive", "Your lights cast shadows but the \"Receive Shadow\" option in this op is not active. Please enable it to use shadows.", 1);
                }
            }
            else
            {
                op.setUiError("nolights2", "There are lights in the patch but none that cast shadows. Please activate the \"Cast Shadow\" property of one of your lights in the patch to make shadows visible.", 1);
                op.setUiError("inReceiveShadowActive", null);
            }

            if (!allLightsBlurAboveZero)
            {
                if (inAlgorithm.get() === "VSM")
                {
                    op.setUiError("vsmBlurZero", "You chose the VSM algorithm but one of your lights still has a blur amount of 0. For VSM to work correctly, consider raising the blur amount in your lights.", 1);
                }
                else
                {
                    op.setUiError("vsmBlurZero", null);
                }
            }
            else
            {
                op.setUiError("vsmBlurZero", null);
            }
        }
    }
    else
    {
        op.setUiError("nolights", "There are no lights in the patch. Please add lights before this op and activate their \"Cast Shadow\" property to be able to use shadows.", 1);
    }
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.ChromaticAberration_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.ChromaticAberration_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"chromatic_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float pixel;\nUNI float onePixel;\nUNI float amount;\nUNI float lensDistort;\n\n#ifdef MASK\nUNI sampler2D texMask;\n#endif\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n   vec4 base=texture(tex,texCoord);\n   vec4 col=texture(tex,texCoord);\n\n   vec2 tc=texCoord;;\n   float pix = pixel;\n   if(lensDistort>0.0)\n   {\n       float dist = distance(texCoord, vec2(0.5,0.5));\n       tc-=0.5;\n       tc *=smoothstep(-0.9,1.0*lensDistort,1.0-dist);\n       tc+=0.5;\n   }\n\n    #ifdef MASK\n        vec4 m=texture(texMask,texCoord);\n        pix*=m.r*m.a;\n    #endif\n\n    #ifdef SMOOTH\n    #ifdef WEBGL2\n        float numSamples=round(pix/onePixel/4.0+1.0);\n        col.r=0.0;\n        col.b=0.0;\n\n        for(float off=0.0;off<numSamples;off++)\n        {\n            float diff=(pix/numSamples)*off;\n            col.r+=texture(tex,vec2(tc.x+diff,tc.y)).r/numSamples;\n            col.b+=texture(tex,vec2(tc.x-diff,tc.y)).b/numSamples;\n        }\n    #endif\n    #endif\n\n    #ifndef SMOOTH\n        col.r=texture(tex,vec2(tc.x+pix,tc.y)).r;\n        col.b=texture(tex,vec2(tc.x-pix,tc.y)).b;\n    #endif\n\n   outColor= cgl_blendPixel(base,col,amount);\n\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    pixel = op.inValue("Pixel", 5),
    lensDistort = op.inValueSlider("Lens Distort", 0),
    doSmooth = op.inValueBool("Smooth", false),
    textureMask = op.inTexture("Mask"),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "chromatic");

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

shader.setSource(shader.getDefaultVertexShader(), attachments.chromatic_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    uniPixel = new CGL.Uniform(shader, "f", "pixel", 0),
    uniOnePixel = new CGL.Uniform(shader, "f", "onePixel", 0),
    unitexMask = new CGL.Uniform(shader, "t", "texMask", 1),
    uniAmount = new CGL.Uniform(shader, "f", "amount", amount),
    unilensDistort = new CGL.Uniform(shader, "f", "lensDistort", lensDistort);

doSmooth.onChange = function ()
{
    if (doSmooth.get())shader.define("SMOOTH");
    else shader.removeDefine("SMOOTH");
};

textureMask.onChange = function ()
{
    if (textureMask.get())shader.define("MASK");
    else shader.removeDefine("MASK");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    uniPixel.setValue(pixel.get() * (1 / texture.width));
    uniOnePixel.setValue(1 / texture.width);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, texture.tex);

    if (textureMask.get()) cgl.setTexture(1, textureMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Extension.FxHash.FxHash
// 
// **************************************************************

Ops.Extension.FxHash.FxHash= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
if(!window.$fx)
{
    console.log("$fx not found");
}
window.$fx=window.$fx||{};

if (!CABLES.fakefxhash && !window.$fx.hash || CABLES.fakefxhash)
{
    CABLES.fakefxhash = true;
}

const
    isReal = !CABLES.fakefxhash,
    alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

const
    inHash = op.inString("Hash", ""),
    inRandomizeHash = op.inTriggerButton("Randomize Hash"),
    outHash = op.outString("fxhash"),
    outRandom1 = op.outNumber("fxrand 1"),
    outRandom2 = op.outNumber("fxrand 2"),
    outRandom3 = op.outNumber("fxrand 3"),
    outRandom4 = op.outNumber("fxrand 4"),
    outArr = op.outArray("Random Numbers"),
    outEmbedded = op.outBoolNum("fxhash environment", isReal);

inHash.onChange = init;

let inited = false;

init();

inRandomizeHash.onTriggered = () =>
{
    inHash.set(randomHash());
    op.refreshParams();
};

function randomHash()
{
    let str = "";
    const all = alphabet.length - 1;

    for (let i = 0; i < 51; i++)
    {
        str += alphabet[Math.round(Math.random() * all)];
    }
    return str;
}

function init()
{
    if (isReal && inited) return;
    if (!isReal)
    {
        window.$fx.hash = inHash.get() || randomHash();
        let b58dec = (str) => { return [...str].reduce((p, c) => { return p * alphabet.length + alphabet.indexOf(c) | 0; }, 0); };
        let fxhashTrunc = window.$fx.hash.slice(2);
        let regex = new RegExp(".{" + ((window.$fx.hash.length / 4) | 0) + "}", "g");
        let hashes = fxhashTrunc.match(regex).map((h) => { return b58dec(h); });

        let sfc32 = (a, b, c, d) =>
        {
            return () =>
            {
                a |= 0; b |= 0; c |= 0; d |= 0;
                let t = (a + b | 0) + d | 0;
                d = d + 1 | 0;
                a = b ^ b >>> 9;
                b = c + (c << 3) | 0;
                c = c << 21 | c >>> 11;
                c = c + t | 0;
                return (t >>> 0) / 4294967296;
            };
        };

        window.$fx.rand = sfc32(...hashes);
    }

    inited = true;

    outHash.set(window.$fx.hash);

    outRandom1.set(0);
    outRandom2.set(0);
    outRandom3.set(0);
    outRandom4.set(0);

    outRandom1.set(window.$fx.rand());
    outRandom2.set(window.$fx.rand());
    outRandom3.set(window.$fx.rand());
    outRandom4.set(window.$fx.rand());

    const arr = [];
    for (let i = 0; i < 1000; i++)arr.push(window.$fx.rand());
    outArr.setRef(arr);
}

}
};






// **************************************************************
// 
// Ops.Ui.Area
// 
// **************************************************************

Ops.Ui.Area= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inTitle = op.inString("Title", ""),
    inDelete = op.inTriggerButton("Delete");

inTitle.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "hasArea": true });

op.init =
    inTitle.onChange =
    op.onLoaded = update;

update();

function update()
{
    if (CABLES.UI)
    {
        gui.savedState.setUnSaved("areaOp", op.getSubPatch());
        op.uiAttr(
            {
                "comment_title": inTitle.get() || " "
            });

        op.name = inTitle.get();
    }
}

inDelete.onTriggered = () =>
{
    op.patch.deleteOp(op.id);
};

}
};






// **************************************************************
// 
// Ops.Devices.Keyboard.KeyPressLearn
// 
// **************************************************************

Ops.Devices.Keyboard.KeyPressLearn= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    learnedKeyCode = op.inValueInt("key code"),
    canvasOnly = op.inValueBool("canvas only", true),
    modKey = op.inValueSelect("Mod Key", ["none", "alt"], "none"),
    inEnable = op.inValueBool("Enabled", true),
    preventDefault = op.inValueBool("Prevent Default"),
    learn = op.inTriggerButton("learn"),
    onPress = op.outTrigger("on press"),
    onRelease = op.outTrigger("on release"),
    outPressed = op.outBoolNum("Pressed", false),
    outKey = op.outString("Key");

const cgl = op.patch.cgl;
let learning = false;
let dia = null;
modKey.onChange = learnedKeyCode.onChange = updateKeyName;

addCanvasListener();

function onKeyDown(e)
{
    if (learning)
    {
        learnedKeyCode.set(e.keyCode);
        if (CABLES.UI)
        {
            if (dia)dia.close();
            op.refreshParams();
        }
        learning = false;
        removeListeners();
        addListener();

        if (CABLES.UI)gui.emitEvent("portValueEdited", op, learnedKeyCode, learnedKeyCode.get());
    }
    else
    {
        if (e.keyCode == learnedKeyCode.get())
        {
            if (modKey.get() == "alt")
            {
                if (e.altKey === true)
                {
                    onPress.trigger();
                    outPressed.set(true);
                    if (preventDefault.get())e.preventDefault();
                }
            }
            else
            {
                onPress.trigger();
                outPressed.set(true);
                if (preventDefault.get())e.preventDefault();
            }
        }
    }
}

function onKeyUp(e)
{
    if (e.keyCode == learnedKeyCode.get())
    {
        let doTrigger = true;
        if (modKey.get() == "alt" && e.altKey != true) doTrigger = false;

        if (doTrigger)
        {
            onRelease.trigger();
            outPressed.set(false);
        }
    }
}

op.onDelete = function ()
{
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    document.removeEventListener("keydown", onKeyDown, false);
};

learn.onTriggered = function ()
{
    if (!CABLES.UI) return;

    learning = true;
    addDocumentListener();

    dia = new CABLES.UI.ModalDialog({
        "title": "Learn Key...",
        "text": "Just press any key" });

    dia.on("close", () =>
    {
        learning = false;
        removeListeners();
        addListener();
        dia = null;
    });
};

function addListener()
{
    if (canvasOnly.get()) addCanvasListener();
    else addDocumentListener();
}

function removeListeners()
{
    document.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    outPressed.set(false);
}

function addCanvasListener()
{
    if (!CABLES.isNumeric(cgl.canvas.getAttribute("tabindex"))) cgl.canvas.setAttribute("tabindex", 1);

    cgl.canvas.addEventListener("keydown", onKeyDown, false);
    cgl.canvas.addEventListener("keyup", onKeyUp, false);
}

function addDocumentListener()
{
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

inEnable.onChange = function ()
{
    if (!inEnable.get())
    {
        removeListeners();
    }
    else
    {
        addListener();
    }
};

canvasOnly.onChange = function ()
{
    removeListeners();
    addListener();
};

function updateKeyName()
{
    let keyName = keyCodeToName(learnedKeyCode.get());
    const modKeyName = modKey.get();
    if (modKeyName && modKeyName !== "none")
    {
        keyName = modKeyName.charAt(0).toUpperCase() + modKeyName.slice(1) + "-" + keyName;
    }
    op.setUiAttribs({ "extendTitle": keyName });
    outKey.set(keyName);
}

// todo remove in next version
function keyCodeToName(keyCode)
{
    if (!keyCode && keyCode !== 0) return "Unidentified";
    const keys = {
        "8": "Backspace",
        "9": "Tab",
        "12": "Clear",
        "13": "Enter",
        "16": "Shift",
        "17": "Control",
        "18": "Alt",
        "19": "Pause",
        "20": "CapsLock",
        "27": "Escape",
        "32": "Space",
        "33": "PageUp",
        "34": "PageDown",
        "35": "End",
        "36": "Home",
        "37": "ArrowLeft",
        "38": "ArrowUp",
        "39": "ArrowRight",
        "40": "ArrowDown",
        "45": "Insert",
        "46": "Delete",
        "112": "F1",
        "113": "F2",
        "114": "F3",
        "115": "F4",
        "116": "F5",
        "117": "F6",
        "118": "F7",
        "119": "F8",
        "120": "F9",
        "121": "F10",
        "122": "F11",
        "123": "F12",
        "144": "NumLock",
        "145": "ScrollLock",
        "224": "Meta"
    };
    if (keys[keyCode])
    {
        return keys[keyCode];
    }
    else
    {
        return String.fromCharCode(keyCode);
    }
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.ColorMap_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.ColorMap_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"colormap_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D gradient;\nUNI float pos;\nUNI float amount;\nUNI float vmin;\nUNI float vmax;\n\n{{CGL.BLENDMODES3}}\n\n\nfloat lumi(vec3 color)\n{\n   return vec3(dot(vec3(0.2126,0.7152,0.0722), color)).r;\n}\n\nvoid main()\n{\n    vec4 base=texture(tex,texCoord);\n    float a=base.a;\n\n    base=clamp(base,vmin,vmax);\n\n    #ifdef METH_LUMI\n        vec4 color=texture(gradient,vec2(lumi(base.rgb),pos));\n    #endif\n\n    #ifdef METH_CHANNELS\n        vec4 color=vec4(1.0);\n        color.r=texture(gradient,vec2(base.r,pos)).r;\n        color.g=texture(gradient,vec2(base.g,pos)).g;\n        color.b=texture(gradient,vec2(base.b,pos)).b;\n    #endif\n\n    base.a=color.a=a;\n\n\n    outColor=cgl_blendPixel(base,color,amount);\n\n}\n",};
let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

const blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal");
const amount = op.inValueSlider("Amount", 1);

let inGradient = op.inTexture("Gradient");
let inMethod = op.inSwitch("Method", ["Luminance", "Channels"], "Luminance");

let inMin = op.inFloatSlider("Min", 0);
let inMax = op.inFloatSlider("Max", 1);

let inPos = op.inValueSlider("Position", 0.5);

op.setPortGroup("Vertical Position", [inMin, inMax, inPos]);

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);
shader.define("METH_LUMI");

shader.setSource(shader.getDefaultVertexShader(), attachments.colormap_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let textureUniform2 = new CGL.Uniform(shader, "t", "gradient", 1);
let uniPos = new CGL.Uniform(shader, "f", "pos", inPos);
let uniMin = new CGL.Uniform(shader, "f", "vmin", inMin);
let uniMax = new CGL.Uniform(shader, "f", "vmax", inMax);
let uniAmount = new CGL.Uniform(shader, "f", "amount", amount);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

inMethod.onChange = () =>
{
    shader.toggleDefine("METH_LUMI", inMethod.get() == "Luminance");
    shader.toggleDefine("METH_CHANNELS", inMethod.get() == "Channels");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;
    if (!inGradient.get()) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.setTexture(1, inGradient.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Math.MapRange
// 
// **************************************************************

Ops.Math.MapRange= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    v = op.inValueFloat("value", 0),
    old_min = op.inValueFloat("old min", 0),
    old_max = op.inValueFloat("old max", 1),
    new_min = op.inValueFloat("new min", 0),
    new_max = op.inValueFloat("new max", 1),
    easing = op.inValueSelect("Easing", ["Linear", "Smoothstep", "Smootherstep"], "Linear"),
    inClamp = op.inBool("Clamp", true),
    result = op.outNumber("result", 0);

op.setPortGroup("Input Range", [old_min, old_max]);
op.setPortGroup("Output Range", [new_min, new_max]);

let doClamp = true;
let ease = 0;
let r = 0;

v.onChange =
    old_min.onChange =
    old_max.onChange =
    new_min.onChange =
    new_max.onChange = exec;

exec();

inClamp.onChange =
() =>
{
    doClamp = inClamp.get();
    exec();
};

easing.onChange = function ()
{
    if (easing.get() == "Smoothstep") ease = 1;
    else if (easing.get() == "Smootherstep") ease = 2;
    else ease = 0;
};

function exec()
{
    const nMin = new_min.get();
    const nMax = new_max.get();
    const oMin = old_min.get();
    const oMax = old_max.get();
    let x = v.get();

    if (doClamp)
    {
        if (x >= Math.max(oMax, oMin))
        {
            result.set(nMax);
            return;
        }
        else
        if (x <= Math.min(oMax, oMin))
        {
            result.set(nMin);
            return;
        }
    }

    let reverseInput = false;
    const oldMin = Math.min(oMin, oMax);
    const oldMax = Math.max(oMin, oMax);
    if (oldMin != oMin) reverseInput = true;

    let reverseOutput = false;
    const newMin = Math.min(nMin, nMax);
    const newMax = Math.max(nMin, nMax);
    if (newMin != nMin) reverseOutput = true;

    let portion = 0;

    if (reverseInput) portion = (oldMax - x) * (newMax - newMin) / (oldMax - oldMin);
    else portion = (x - oldMin) * (newMax - newMin) / (oldMax - oldMin);

    if (reverseOutput) r = newMax - portion;
    else r = portion + newMin;

    if (ease === 0)
    {
        result.set(r);
    }
    else
    if (ease == 1)
    {
        x = Math.max(0, Math.min(1, (r - nMin) / (nMax - nMin)));
        result.set(nMin + x * x * (3 - 2 * x) * (nMax - nMin)); // smoothstep
    }
    else
    if (ease == 2)
    {
        x = Math.max(0, Math.min(1, (r - nMin) / (nMax - nMin)));
        result.set(nMin + x * x * x * (x * (x * 6 - 15) + 10) * (nMax - nMin)); // smootherstep
    }
}

}
};






// **************************************************************
// 
// Ops.Color.ColorPalettes
// 
// **************************************************************

Ops.Color.ColorPalettes= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const index = op.inValueInt("Index", 0);
const textureOut = op.outTexture("Texture");
const inLinear = op.inValueBool("Smooth");
const arrOut = op.outArray("Color Array");

let canvas = document.createElement("canvas");
canvas.id = "canvas_" + CABLES.generateUUID();
canvas.width = 5;
canvas.height = 8;
canvas.style.display = "none";

let body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);
let ctx = canvas.getContext("2d");

index.onChange =
inLinear.onChange = buildTextureLater;

let arr = [];
arr.length = 5 * 3;
let lastFilter = null;

buildTextureLater();

function hexToR(h)
{
    return parseInt((cutHex(h)).substring(0, 2), 16);
}

function hexToG(h)
{
    return parseInt((cutHex(h)).substring(2, 4), 16);
}

function hexToB(h)
{
    return parseInt((cutHex(h)).substring(4, 6), 16);
}

function cutHex(h = "")
{
    return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
}

function buildTextureLater()
{
    op.patch.cgl.addNextFrameOnceCallback(buildTexture);
}

function buildTexture()
{
    let ind = Math.round(index.get()) * 5;
    if (ind >= colors.length - 5)ind = 0;
    if (ind < 0)ind = 0;
    if (ind != ind)ind = 0;

    for (let i = 0; i < 5; i++)
    {
        let r = hexToR(colors[ind + i]);
        let g = hexToG(colors[ind + i]);
        let b = hexToB(colors[ind + i]);

        arr[i * 3 + 0] = r / 255;
        arr[i * 3 + 1] = g / 255;
        arr[i * 3 + 2] = b / 255;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(
            canvas.width / 5 * i,
            0,
            canvas.width / 5,
            canvas.height
        );
    }

    let filter = CGL.Texture.FILTER_NEAREST;
    if (inLinear.get())filter = CGL.Texture.FILTER_LINEAR;

    if (lastFilter == filter && textureOut.get()) textureOut.get().initTexture(canvas, filter);
    else textureOut.set(new CGL.Texture.createFromImage(op.patch.cgl, canvas, { "filter": filter }));

    arrOut.set(null);
    arrOut.set(arr);
    textureOut.get().unpackAlpha = false;
    lastFilter = filter;
}

op.onDelete = function ()
{
    canvas.remove();
};

const colors = [
    "#E6E2AF", "#A7A37E", "#EFECCA", "#046380", "002F2F",
    "#468966", "#FFF0A5", "#FFB03B", "#B64926", "8E2800",
    "#FCFFF5", "#D1DBBD", "#91AA9D", "#3E606F", "193441",
    "#FF6138", "#FFFF9D", "#BEEB9F", "#79BD8F", "00A388",
    "#105B63", "#FFFAD5", "#FFD34E", "#DB9E36", "BD4932",
    "#225378", "#1695A3", "#ACF0F2", "#F3FFE2", "EB7F00",
    "#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB", "2980B9",
    "#000000", "#263248", "#7E8AA2", "#FFFFFF", "FF9800",
    "#004358", "#1F8A70", "#BEDB39", "#FFE11A", "FD7400",
    "#DC3522", "#D9CB9E", "#374140", "#2A2C2B", "1E1E20",
    "#7D8A2E", "#C9D787", "#FFFFFF", "#FFC0A9", "FF8598",
    "#B9121B", "#4C1B1B", "#F6E497", "#FCFAE1", "BD8D46",
    "#2E0927", "#D90000", "#FF2D00", "#FF8C00", "04756F",
    "#595241", "#B8AE9C", "#FFFFFF", "#ACCFCC", "8A0917",
    "#10222B", "#95AB63", "#BDD684", "#E2F0D6", "F6FFE0",
    "#F6F792", "#333745", "#77C4D3", "#DAEDE2", "EA2E49",
    "#703030", "#2F343B", "#7E827A", "#E3CDA4", "C77966",
    "#2F2933", "#01A2A6", "#29D9C2", "#BDF271", "FFFFA6",
    "#D8CAA8", "#5C832F", "#284907", "#382513", "363942",
    "#FFF8E3", "#CCCC9F", "#33332D", "#9FB4CC", "DB4105",
    "#85DB18", "#CDE855", "#F5F6D4", "#A7C520", "493F0B",
    "#04BFBF", "#CAFCD8", "#F7E967", "#A9CF54", "588F27",
    "#292929", "#5B7876", "#8F9E8B", "#F2E6B6", "412A22",
    "#332532", "#644D52", "#F77A52", "#FF974F", "A49A87",
    "#405952", "#9C9B7A", "#FFD393", "#FF974F", "F54F29",
    "#2B3A42", "#3F5765", "#BDD4DE", "#EFEFEF", "FF530D",
    "#962D3E", "#343642", "#979C9C", "#F2EBC7", "348899",
    "#96CA2D", "#B5E655", "#EDF7F2", "#4BB5C1", "7FC6BC",
    "#1C1D21", "#31353D", "#445878", "#92CDCF", "EEEFF7",
    "#3E454C", "#2185C5", "#7ECEFD", "#FFF6E5", "FF7F66",
    "#00585F", "#009393", "#FFFCC4", "#F0EDBB", "FF3800",
    "#B4AF91", "#787746", "#40411E", "#32331D", "C03000",
    "#63A69F", "#F2E1AC", "#F2836B", "#F2594B", "CD2C24",
    "#88A825", "#35203B", "#911146", "#CF4A30", "ED8C2B",
    "#F2385A", "#F5A503", "#E9F1DF", "#4AD9D9", "36B1BF",
    "#CFC291", "#FFF6C5", "#A1E8D9", "#FF712C", "695D46",
    "#FF5335", "#B39C85", "#306E73", "#3B424D", "1D181F",
    "#000000", "#333333", "#FF358B", "#01B0F0", "AEEE00",
    "#E8E595", "#D0A825", "#40627C", "#26393D", "FFFAE4",
    "#E7E8D1", "#D3CEAA", "#FBF7E4", "#424242", "8E001C",
    "#354242", "#ACEBAE", "#FFFF9D", "#C9DE55", "7D9100",
    "#2F2933", "#01A2A6", "#29D9C2", "#BDF271", "FFFFA6",
    "#DDDCC5", "#958976", "#611427", "#1D2326", "6A6A61",
    "#6C6E58", "#3E423A", "#417378", "#A4CFBE", "F4F7D9",
    "#E1E6FA", "#C4D7ED", "#ABC8E2", "#375D81", "183152",
    "#6B0C22", "#D9042B", "#F4CB89", "#588C8C", "011C26",
    "#304269", "#91BED4", "#D9E8F5", "#FFFFFF", "F26101",
    "#96CEB4", "#FFEEAD", "#FF6F69", "#FFCC5C", "AAD8B0",
    "#B0CC99", "#677E52", "#B7CA79", "#F6E8B1", "89725B",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF5A49",
    "#16193B", "#35478C", "#4E7AC7", "#7FB2F0", "ADD5F7",
    "#00261C", "#044D29", "#168039", "#45BF55", "96ED89",
    "#36362C", "#5D917D", "#A8AD80", "#E6D4A7", "825534",
    "#F9E4AD", "#E6B098", "#CC4452", "#723147", "31152B",
    "#2C3E50", "#FC4349", "#D7DADB", "#6DBCDB", "FFFFFF",
    "#002635", "#013440", "#AB1A25", "#D97925", "EFE7BE",
    "#FF8000", "#FFD933", "#CCCC52", "#8FB359", "192B33",
    "#272F32", "#9DBDC6", "#FFFFFF", "#FF3D2E", "DAEAEF",
    "#B8ECD7", "#083643", "#B1E001", "#CEF09D", "476C5E",
    "#002F32", "#42826C", "#A5C77F", "#FFC861", "C84663",
    "#5C4B51", "#8CBEB2", "#F2EBBF", "#F3B562", "F06060",
    "#5A1F00", "#D1570D", "#FDE792", "#477725", "A9CC66",
    "#5E0042", "#2C2233", "#005869", "#00856A", "8DB500",
    "#52656B", "#FF3B77", "#CDFF00", "#FFFFFF", "B8B89F",
    "#801637", "#047878", "#FFB733", "#F57336", "C22121",
    "#730046", "#BFBB11", "#FFC200", "#E88801", "C93C00",
    "#24221F", "#363F45", "#4B5F6D", "#5E7C88", "FEB41C",
    "#E64661", "#FFA644", "#998A2F", "#2C594F", "002D40",
    "#C24704", "#D9CC3C", "#FFEB79", "#A0E0A9", "00ADA7",
    "#484A47", "#C1CE96", "#ECEBF0", "#687D77", "353129",
    "#588C7E", "#F2E394", "#F2AE72", "#D96459", "8C4646",
    "#BAB293", "#A39770", "#EFE4BD", "#A32500", "2B2922",
    "#6A7059", "#FDEEA7", "#9BCC93", "#1A9481", "003D5C",
    "#174C4F", "#207178", "#FF9666", "#FFE184", "F5E9BE",
    "#D5FBFF", "#9FBCBF", "#647678", "#2F3738", "59D8E6",
    "#DB5800", "#FF9000", "#F0C600", "#8EA106", "59631E",
    "#450003", "#5C0002", "#94090D", "#D40D12", "FF1D23",
    "#211426", "#413659", "#656F8C", "#9BBFAB", "F2EFDF",
    "#EA6045", "#F8CA4D", "#F5E5C0", "#3F5666", "2F3440",
    "#F2F2F2", "#C6E070", "#91C46C", "#287D7D", "1C344D",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF5A49",
    "#705B35", "#C7B07B", "#E8D9AC", "#FFF6D9", "570026",
    "#F7F2B2", "#ADCF4F", "#84815B", "#4A1A2C", "8E3557",
    "#1A1F2B", "#30395C", "#4A6491", "#85A5CC", "D0E4F2",
    "#25064D", "#36175E", "#553285", "#7B52AB", "9768D1",
    "#004056", "#2C858D", "#74CEB7", "#C9FFD5", "FFFFCB",
    "#CFCA4C", "#FCF5BF", "#9FE5C2", "#5EB299", "745A33",
    "#776045", "#A8C545", "#DFD3B6", "#FFFFFF", "0092B2",
    "#CC3910", "#F1F2C0", "#CCC59E", "#8FA68E", "332F29",
    "#FF6600", "#C13B00", "#5E6D70", "#424E4F", "1B1D1E",
    "#690011", "#BF0426", "#CC2738", "#F2D99C", "E5B96F",
    "#1B1D26", "#425955", "#778C7A", "#F1F2D8", "BFBD9F",
    "#F6B1C3", "#F0788C", "#DE264C", "#BC0D35", "A20D1E",
    "#597533", "#332F28", "#61B594", "#E6DEA5", "C44E18",
    "#3FB8AF", "#7FC7AF", "#DAD8A7", "#FF9E9D", "FF3D7F",
    "#0F2D40", "#194759", "#296B73", "#3E8C84", "D8F2F0",
    "#42282F", "#74A588", "#D6CCAD", "#DC9C76", "D6655A",
    "#002A4A", "#17607D", "#FFF1CE", "#FF9311", "D64700",
    "#003056", "#04518C", "#00A1D9", "#47D9BF", "F2D03B",
    "#13140F", "#D4FF00", "#E4FFE6", "#68776C", "00D6DD",
    "#FCFAD0", "#A1A194", "#5B605F", "#464646", "A90641",
    "#289976", "#67CC8E", "#B1FF91", "#FFE877", "FF5600",
    "#302B1D", "#3F522B", "#737D26", "#A99E46", "D9CB84",
    "#56626B", "#6C9380", "#C0CA55", "#F07C6C", "AD5472",
    "#32450C", "#717400", "#DC8505", "#EC5519", "BE2805",
    "#C7B773", "#E3DB9A", "#F5FCD0", "#B1C2B3", "778691",
    "#E83A25", "#FFE9A3", "#98CC96", "#004563", "191B28",
    "#3399CC", "#67B8DE", "#91C9E8", "#B4DCED", "E8F8FF",
    "#1A212C", "#1D7872", "#71B095", "#DEDBA7", "D13F32",
    "#7D2A35", "#CC9258", "#917A56", "#B4BA6C", "FEFFC2",
    "#E7E9D1", "#D3D4AA", "#FCFAE6", "#444444", "901808",
    "#FFFFFF", "#AEAEAE", "#E64C66", "#2D3E50", "1BBC9B",
    "#E0FFB3", "#61C791", "#31797D", "#2A2F36", "F23C55",
    "#EB5937", "#1C1919", "#403D3C", "#456F74", "D3CBBD",
    "#E6DD00", "#8CB302", "#008C74", "#004C66", "332B40",
    "#14A697", "#F2C12E", "#F29D35", "#F27649", "F25252",
    "#261822", "#40152A", "#731630", "#CC1E2C", "FF5434",
    "#261F27", "#FEE169", "#CDD452", "#F9722E", "C9313D",
    "#5C4B51", "#8CBEB2", "#F2EBBF", "#F3B562", "F06060",
    "#2F3837", "#C5C7B6", "#FFF8D3", "#4C493E", "222028",
    "#E3CBAC", "#9C9985", "#C46D3B", "#788880", "324654",
    "#3F0B1B", "#7A1631", "#CF423C", "#FC7D49", "FFD462",
    "#14212B", "#293845", "#4F6373", "#8F8164", "D9D7AC",
    "#98A89E", "#BAC0AC", "#FAFAC6", "#FF4411", "D40015",
    "#FEFFFF", "#3C3F36", "#9FB03E", "#EBE9DC", "72918B",
    "#CC6B32", "#FFAB48", "#FFE7AD", "#A7C9AE", "888A63",
    "#262526", "#404040", "#8C8979", "#F2F2F2", "F60A20",
    "#00305A", "#004B8D", "#0074D9", "#4192D9", "7ABAF2",
    "#0C273D", "#54D0ED", "#FFFEF1", "#70B85D", "2C5E2E",
    "#4C1B33", "#EFE672", "#98A942", "#2D6960", "141D14",
    "#2F3540", "#666A73", "#F2EDE4", "#D9D1C7", "8C8681",
    "#0D1F30", "#3B6670", "#8BADA3", "#F0E3C0", "DB6C0F",
    "#FFBC67", "#DA727E", "#AC6C82", "#685C79", "455C7B",
    "#092140", "#024959", "#F2C777", "#F24738", "BF2A2A",
    "#133463", "#365FB7", "#799AE0", "#F4EFDC", "BA9B65",
    "#C4D4CB", "#55665E", "#30282A", "#542733", "E84167",
    "#CDDEC6", "#4DAAAB", "#1E4F6A", "#2A423C", "93A189",
    "#EF5411", "#FA5B0F", "#FF6517", "#FF6D1F", "FF822E",
    "#41434A", "#6E9489", "#DEDCC3", "#F2F1E9", "877963",
    "#292929", "#2BBFBD", "#F2B33D", "#F29B30", "F22E2E",
    "#F2385A", "#F5A503", "#E9F1DF", "#56D9CD", "3AA1BF",
    "#D5F8B4", "#A6E3A8", "#8A9A85", "#7E566B", "422335",
    "#3CBAC8", "#93EDD4", "#F3F5C4", "#F9CB8F", "F19181",
    "#979926", "#38CCB5", "#EEFF8E", "#FFD767", "CC2A09",
    "#404040", "#024959", "#037E8C", "#F2EFDC", "F24C27",
    "#94B34D", "#D3FF82", "#363D52", "#121D2B", "111B1C",
    "#282E33", "#25373A", "#164852", "#495E67", "FF3838",
    "#313732", "#8AA8B0", "#DEDEDE", "#FFFFFF", "F26101",
    "#FFFFFF", "#E5E1D1", "#52616D", "#2C343B", "C44741",
    "#FFF6B8", "#ABCCA7", "#403529", "#7A5E2F", "A68236",
    "#4F1025", "#C5003E", "#D9FF5B", "#78AA00", "15362D",
    "#49404F", "#596166", "#D1FFCD", "#A9BD8B", "948A54",
    "#FF2151", "#FF7729", "#FFAD29", "#FFEBCA", "1AB58A",
    "#73603D", "#BF8A49", "#F2CA80", "#5E5A59", "0D0D0D",
    "#3D4C53", "#70B7BA", "#F1433F", "#E7E1D4", "FFFFFF",
    "#006D8D", "#008A6E", "#549E39", "#8AB833", "C0CF3A",
    "#BDDFB3", "#2BAA9C", "#2F2E2E", "#0F2625", "465F3F",
    "#F2F2F2", "#BF0404", "#8C0303", "#590202", "400101",
    "#76A19A", "#272123", "#A68D60", "#B0C5BB", "D9593D",
    "#0E3D59", "#88A61B", "#F29F05", "#F25C05", "D92525",
    "#C1E1ED", "#76C7C6", "#273D3B", "#131A19", "E35C14",
    "#2D112C", "#530031", "#820233", "#CA293E", "EF4339",
    "#AF7575", "#EFD8A1", "#BCD693", "#AFD7DB", "3D9CA8",
    "#D74B4B", "#DCDDD8", "#475F77", "#354B5E", "FFFFFF",
    "#FFF6C9", "#C8E8C7", "#A4DEAB", "#85CC9F", "499E8D",
    "#229396", "#8BA88F", "#C7C5A7", "#F0DFD0", "F23C3C",
    "#57385C", "#A75265", "#EC7263", "#FEBE7E", "FFEDBC",
    "#96526B", "#D17869", "#EBAD60", "#F5CF66", "8BAB8D",
    "#0D1C33", "#17373C", "#2B6832", "#4F9300", "A1D700",
    "#1B2B32", "#37646F", "#A3ABAF", "#E1E7E8", "B22E2F",
    "#C5D9B2", "#53A194", "#572C2C", "#3D2324", "695A3B",
    "#425957", "#81AC8B", "#F2E5A2", "#F89883", "D96666",
    "#002E40", "#2A5769", "#FFFFFF", "#FABD4A", "FA9600",
    "#FFFEFC", "#E2E3DF", "#515B5E", "#2E3233", "CAF200",
    "#FFF0A3", "#B8CC6E", "#4B6000", "#E4F8FF", "004460",
    "#3B596A", "#427676", "#3F9A82", "#A1CD73", "ECDB60",
    "#F2E6CE", "#8AB39F", "#606362", "#593325", "1D1D1F",
    "#212B40", "#C2E078", "#FFFFFF", "#BADCDD", "547B97",
    "#0B3C4D", "#0E5066", "#136480", "#127899", "1A8BB3",
    "#222130", "#464D57", "#D4E8D3", "#FFFCFB", "ED8917",
    "#B33600", "#FF8A00", "#FFC887", "#CC5400", "B31E00",
    "#012530", "#28544B", "#ACBD86", "#FFD6A0", "FF302C",
    "#2E95A3", "#50B8B4", "#C6FFFA", "#E2FFA8", "D6E055",
    "#112F41", "#068587", "#4FB99F", "#F2B134", "ED553B",
    "#202B30", "#4E7178", "#4FA9B8", "#74C0CF", "F1F7E2",
    "#302B2F", "#696153", "#FFA600", "#9BB58F", "FFD596",
    "#458C6B", "#F2D8A7", "#D9A86C", "#D94436", "A62424",
    "#22475E", "#75B08A", "#F0E797", "#FF9D84", "FF5460",
    "#FFAA5C", "#DA727E", "#AC6C82", "#685C79", "455C7B",
    "#686E75", "#9BAAC1", "#82787B", "#E4F1DB", "AAC19B",
    "#F0C755", "#E2AD3B", "#BF5C00", "#901811", "5C110F",
    "#FFFBDC", "#BFBCA5", "#7F7D6E", "#3F3E37", "E5E2C6",
    "#BEBEBE", "#F1E4D8", "#594735", "#94C7BA", "D8F1E4",
    "#1B1E26", "#F2EFBD", "#B6D051", "#70A99A", "2F6D7A",
    "#F7E4A2", "#A7BD5B", "#DC574E", "#8DC7B8", "ED9355",
    "#70E8CB", "#FFE9C7", "#FF5B5B", "#545454", "2D2D2F",
    "#17111A", "#321433", "#660C47", "#B33467", "CCBB51",
    "#2B2E2E", "#595855", "#A2ABA5", "#CAE6E8", "313F54",
    "#023B47", "#295E52", "#F2E085", "#FCAB55", "EE7F38",
    "#302C29", "#D1D1BC", "#A7C4BB", "#6C8C84", "466964",
    "#212629", "#067778", "#49B8A8", "#85EDB6", "D9E5CD",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF4949",
    "#2C3E50", "#FC4349", "#6DBCDB", "#D7DADB", "FFFFFF",
    "#35262D", "#FFFBFF", "#E8ECED", "#A4B7BB", "76A0B0",
    "#61E8D2", "#FCEEB9", "#302F25", "#704623", "BBE687",
    "#E1E6B9", "#C4D7A4", "#ABC8A4", "#375D3B", "183128",
    "#C98B2F", "#803C27", "#C56520", "#E1B41B", "807916",
    "#A3D9B0", "#93BF9E", "#F2F0D5", "#8C8474", "40362E",
    "#524656", "#CF4747", "#EA7A58", "#E4DCCB", "A6C4BC",
    "#5C2849", "#A73E5C", "#EC4863", "#FFDA66", "1FCECB",
    "#0EEAFF", "#15A9FA", "#1B76FF", "#1C3FFD", "2C1DFF",
    "#010000", "#393845", "#9B96A3", "#5C0009", "940315",
    "#468071", "#FFE87A", "#FFCA53", "#FF893B", "E62738",
    "#404040", "#024959", "#037E8C", "#F2EFDC", "F24C27",
    "#FF765E", "#C2AE8B", "#FCCF65", "#FFE5C6", "B7BDC4",
    "#003647", "#00717D", "#F2D8A7", "#A4A66A", "515932",
    "#FAFAC0", "#C4BE90", "#8C644C", "#594D37", "293033",
    "#2B3A42", "#3F5765", "#BDD4DE", "#EFEFEF", "E74C3C",
    "#3B3B3B", "#A8877E", "#FFA49D", "#FF7474", "FF476C",
    "#0A3A4A", "#196674", "#33A6B2", "#9AC836", "D0E64B",
    "#FFA340", "#38001C", "#571133", "#017A74", "00C2BA",
    "#DCEBDD", "#A0D5D6", "#789AA1", "#304345", "AD9A27",
    "#588C7E", "#F2E394", "#F2AE72", "#D96459", "8C4646",
    "#F0E6B1", "#B5D6AA", "#99A37A", "#70584B", "3D3536",
    "#2F400D", "#8CBF26", "#A8CA65", "#E8E5B0", "419184",
    "#010712", "#13171F", "#1C1F26", "#24262D", "961227",
    "#403F33", "#6E755F", "#AFC2AA", "#FFDEA1", "E64C10",
    "#C74029", "#FAE8CD", "#128085", "#385052", "F0AD44",
    "#CFF09E", "#A8DBA8", "#79BD9A", "#3B8686", "0B486B",
    "#E0401C", "#E6B051", "#272F30", "#F7EDB7", "9E2B20",
    "#FFE2C5", "#FFEEDD", "#FFDDAA", "#FFC484", "FFDD99",
    "#FFFFE4", "#F2E5BD", "#B9BF8E", "#A69F7C", "8C6865",
    "#5C8A2D", "#AFD687", "#FFFFFF", "#00C3A9", "008798",
    "#4F3130", "#FF1F3D", "#5BE3E3", "#FDFFF1", "8B9698",
    "#D23600", "#D95100", "#DE6D00", "#EE8900", "FCA600",
    "#FFFFFA", "#A1A194", "#5B605F", "#464646", "FF6600",
    "#F34A53", "#FAE3B4", "#AAC789", "#437356", "1E4147",
    "#2A7A8C", "#176273", "#063540", "#E6D9CF", "403D3A",
    "#21455B", "#567D8C", "#A59E8C", "#8C8372", "F2F2F2",
    "#012340", "#026873", "#83A603", "#BBBF45", "F2F0CE",
    "#FDFF98", "#A7DB9E", "#211426", "#6B073B", "DA8C25",
    "#002F36", "#142426", "#D1B748", "#EDDB43", "FFFD84",
    "#420000", "#600000", "#790000", "#931111", "BF1616",
    "#3C989E", "#5DB5A4", "#F4CDA5", "#F57A82", "ED5276",
    "#23A38F", "#B7C11E", "#EFF1C2", "#F0563D", "2E313D",
    "#F5ECD9", "#2BACB5", "#B4CCB9", "#E84D5B", "3B3B3B",
    "#A5EB3C", "#60C21E", "#159E31", "#53DB50", "C5FFCB",
    "#263138", "#406155", "#7C9C71", "#DBC297", "FF5755",
    "#0A111F", "#263248", "#7E8AA2", "#E3E3E3", "C73226",
    "#003B59", "#00996D", "#A5D900", "#F2E926", "FF930E",
    "#00A19A", "#04BF9D", "#F2E85C", "#F53D54", "404040",
    "#324152", "#47535E", "#796466", "#C1836A", "DEA677",
    "#036F73", "#84CDC2", "#FEF2D8", "#F18C79", "EF504F",
    "#174040", "#888C65", "#D9CA9C", "#D98162", "A65858",
    "#56797F", "#87A0A4", "#FCFBDC", "#F2DDB6", "A6937C",
    "#A8BAA9", "#FFF5CF", "#DBCDAD", "#B39C7D", "806854",
    "#60655F", "#AB9675", "#FFE0C9", "#D4CCBA", "CF8442",
    "#BDDFB3", "#009D57", "#2C372E", "#0F2925", "465F3F",
    "#3E3947", "#735360", "#D68684", "#F1B0B0", "EBD0C4",
    "#0A7B83", "#2AA876", "#FFD265", "#F19C65", "CE4D45",
    "#FFFFFF", "#F4921E", "#858585", "#C5D2DB", "3E6B85",
    "#11151E", "#212426", "#727564", "#B9AA81", "690C07",
    "#000000", "#910000", "#CBB370", "#FFFBF1", "21786C",
    "#F78F00", "#C43911", "#75003C", "#37154A", "0F2459",
    "#003354", "#91BED4", "#D9E8F5", "#FFFFFF", "F26101",
    "#3DA8A4", "#7ACCBE", "#FFFFF7", "#FF99A1", "FF5879",
    "#64C733", "#F0F0F0", "#3E879E", "#57524D", "36302B",
    "#343844", "#2AB69D", "#E65848", "#FDC536", "FCF2D7",
    "#E34517", "#F5FF53", "#B4E85E", "#00BD72", "0B4239",
    "#A84B3A", "#FF9F67", "#233138", "#FFF7F5", "4C646B",
    "#59535E", "#FAEEFF", "#F1BAF3", "#5D4970", "372049",
    "#FF6F22", "#D9984F", "#FFE8A9", "#3E4237", "32948A",
    "#5D7370", "#7FA6A1", "#B8D9B8", "#D6EDBD", "FFF5BC",
    "#FFBE00", "#FFDC00", "#FFD10F", "#FFDE20", "E8CA00",
    "#003840", "#005A5B", "#007369", "#008C72", "02A676",
    "#E1E6FA", "#C4D7ED", "#ABC8E2", "#375D81", "183152",
    "#BA2F1D", "#FFF8A4", "#F5E67F", "#264A59", "1E2C30",
    "#222526", "#FFBB6E", "#F28D00", "#D94F00", "80203B",
    "#EBD096", "#D1B882", "#5D8A66", "#1A6566", "21445B",
    "#F00807", "#5F6273", "#A4ABBF", "#CCC9D1", "E2E1E9",
    "#DFE0AF", "#A4BAA2", "#569492", "#41505E", "383245",
    "#152737", "#2B4E69", "#799AA5", "#FFFFF0", "682321",
    "#C44C51", "#FFB6B8", "#FFEFB6", "#A2B5BF", "5F8CA3",
    "#5ADED4", "#4DAAAB", "#26596A", "#163342", "6C98A1",
    "#FF5B2B", "#B1221C", "#34393E", "#8CC6D7", "FFDA8C",
    "#3D4D4D", "#99992E", "#E6E666", "#F2FFBF", "800033",
    "#242424", "#437346", "#97D95C", "#D9FF77", "E9EB9B",
    "#FFEBB0", "#FFB05A", "#F84322", "#C33A1A", "9F3818",
    "#4D2B2F", "#E57152", "#E8DE67", "#FFEFC3", "C0CCAB",
    "#A82221", "#DB5E31", "#EDA23E", "#F2CB67", "BFB840",
    "#3B3140", "#BFB8A3", "#F2E0C9", "#F2B9AC", "D97E7E",
    "#43464D", "#9197A6", "#D3DCF2", "#7690CF", "48577D",
    "#EFDFBB", "#9EBEA6", "#335D6A", "#D64F2A", "7A8A7F",
    "#000001", "#313634", "#C7CECF", "#5C0402", "941515",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF5A49",
    "#F5F4E1", "#D6C9B5", "#B4AA97", "#D44917", "82877A",
    "#19162B", "#1C425C", "#6ABDC4", "#F0E4C5", "D6C28F",
    "#00132B", "#7F9DB0", "#C5E2ED", "#FFFFFF", "F95900",
    "#1F3642", "#6D968D", "#B6CCB8", "#FFE2B3", "56493F",
    "#08A689", "#82BF56", "#C7D93D", "#E9F2A0", "F2F2F2",
    "#DE3961", "#A4E670", "#FFFFDC", "#B3EECC", "00ADA7",
    "#849972", "#D9D094", "#A6A23E", "#4F2F1D", "8F5145",
    "#F41C54", "#FF9F00", "#FBD506", "#A8BF12", "00AAB5",
    "#00585F", "#009393", "#F5F3DC", "#454445", "FF5828",
    "#FF6138", "#FFFF9D", "#BEEB9F", "#79BD8F", "00A388",
    "#140B04", "#332312", "#B59D75", "#E3D2B4", "FFF7EA",
    "#ED3B3B", "#171F26", "#77B59C", "#F2E7B1", "635656",
    "#46594B", "#A6977C", "#D9B384", "#734F30", "260B01",
    "#CCB8A3", "#FF8FB1", "#FFF5EA", "#4E382F", "B29882",
    "#B70000", "#FFFFFF", "#FFCA3D", "#94C4F4", "0092B3",
    "#053B44", "#06736C", "#A53539", "#B9543C", "EAD075",
    "#E8C1B9", "#FFB3AB", "#FFCAB8", "#E8B69C", "FFCEAB",
    "#E7F2DF", "#69043B", "#59023B", "#231E2D", "161726",
    "#E82B1E", "#E5DEAF", "#A0B688", "#557A66", "453625",
    "#F1E6D4", "#BA3D49", "#791F33", "#9F9694", "E3E1DC",
    "#CED59F", "#F1EDC0", "#B1BEA4", "#647168", "282828",
    "#2C3E50", "#E74C3C", "#ECF0F1", "#3498DB", "646464",
    "#DE7047", "#FFDE8D", "#FFFFFF", "#CDDE47", "528540",
    "#8EAB99", "#40232B", "#D95829", "#D97338", "DEC085",
    "#E9662C", "#EBAF3C", "#00AC65", "#068894", "2B2B2B",
    "#46483C", "#A0AA8F", "#EBE3CB", "#FFFFFF", "F26101",
    "#170F0E", "#290418", "#505217", "#FFD372", "FFF1AF",
    "#263545", "#C4273C", "#D7DADB", "#6DBCDB", "FFFFFF",
    "#DCFAC0", "#B1E1AE", "#85C79C", "#56AE8B", "00968B",
    "#075807", "#097609", "#70AF1A", "#B9D40B", "E5EB0B",
    "#521000", "#712800", "#744E1D", "#879666", "F1D98C",
    "#261F26", "#3F3B40", "#6C7367", "#BFBF8A", "F2E086",
    "#2C3E50", "#FC4349", "#D7DADB", "#6DBCDB", "FFFFFF",
    "#506D7D", "#94CCB9", "#FFECA7", "#FFB170", "F07D65",
    "#3F4036", "#8DA681", "#F2E1C2", "#BF2806", "8C1D04",
    "#990700", "#CC542E", "#FF964F", "#FFCB7C", "787730",
    "#195073", "#7F8C1F", "#EE913F", "#F2E5BD", "9FD7C7",
    "#1B3E59", "#F2F0F0", "#FFAC00", "#BF0404", "730202",
    "#EA6045", "#F8CA4D", "#F5E5C0", "#3F5666", "2F3440",
    "#F95759", "#FDA099", "#FFFFFF", "#D9F3CB", "8AC2B0",
    "#265573", "#386D73", "#81A68A", "#9FBF8F", "D4D9B0",
    "#E1DA36", "#FFEA1B", "#6FE4DA", "#1DB0BC", "007BBC",
    "#013859", "#185E65", "#F9CC7F", "#F15C25", "9E1617",
    "#36CC7C", "#D6FFBE", "#94D794", "#228765", "77A668",
    "#94201F", "#D4421F", "#478A80", "#D9E061", "F08835",
    "#F16233", "#00B5B5", "#F0F0F0", "#3E4651", "5C6D7E",
    "#2E806C", "#76CC99", "#E0FFED", "#FF5F3A", "D2413C",
    "#00393B", "#00766C", "#44A18E", "#E5EDB6", "F6695B",
    "#734854", "#F2F2E9", "#D9D7C5", "#A69580", "736766",
    "#03497E", "#0596D5", "#9DEBFC", "#8D7754", "FEB228",
    "#F0E14C", "#FFBB20", "#FA7B12", "#E85305", "59CC0D",
    "#FE4365", "#FC9D9A", "#F9CDAD", "#C8C8A9", "83AF9B",
    "#00557C", "#186D94", "#3488AD", "#81C1DC", "BBE5F3",
    "#DEE8D7", "#918773", "#420A1A", "#240001", "4D493A",
    "#FFFFFF", "#CAC535", "#97AF25", "#158471", "41342C",
    "#041F3D", "#0B2E41", "#165751", "#448C61", "9AC16D",
    "#FA8C01", "#FF6405", "#577700", "#082400", "A0A600",
    "#78C0F9", "#FFDDCE", "#FFFFFF", "#FFDBE6", "FE86A4",
    "#351330", "#CC2A41", "#E7CAA4", "#759A8A", "524549",
    "#02151A", "#043A47", "#087891", "#C8C8C8", "B31D14",
    "#F34A53", "#FAE3B4", "#AAC789", "#437356", "1E4147",
    "#58838C", "#DAD7C7", "#BF996B", "#BF5841", "A61C1C",
    "#556354", "#E68F0D", "#8C948A", "#495450", "42423F",
    "#323640", "#5B6470", "#8C94A1", "#BDC7D6", "DFE2FF",
    "#FF0000", "#FF950B", "#2FA88C", "#DEEB00", "4B2C04",
    "#0F3D48", "#174C5B", "#366774", "#ECECE7", "E96151",
    "#3DBB7E", "#A3CD39", "#FBAC1D", "#F96C1E", "EE4036",
    "#23363B", "#A44F3F", "#F8983D", "#8D9151", "BBC946",
    "#4B5657", "#969481", "#D2C9B0", "#F4E3C1", "B6B835",
    "#E8980C", "#B1F543", "#F2FF00", "#FF5E00", "59BBAB",
    "#849696", "#FEFFFB", "#232D33", "#17384D", "FF972C",
    "#555555", "#7BB38E", "#F4F1D7", "#F8AB65", "F15C4C",
    "#1D3C42", "#67BFAD", "#F2EC99", "#F2C48D", "F25050",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF4949",
    "#B8E1F2", "#249AA7", "#ABD25E", "#F8C830", "F1594A",
    "#FDEDD0", "#BCF1ED", "#FF634D", "#FD795B", "FFF0AA",
    "#FFFFFF", "#E5E1D1", "#52616D", "#2C343B", "C44741",
    "#FFFFF1", "#D5FF9B", "#8FB87F", "#5A7B6C", "374E5A",
    "#010340", "#0E1E8C", "#0003C7", "#1510F0", "1441F7",
    "#002A4A", "#17607D", "#FFF1CE", "#FF9311", "E33200",
    "#871E31", "#CCC097", "#9E9D7B", "#687061", "262626",
    "#F16663", "#F48D6C", "#F2E07B", "#8ABE9B", "4A6D8B",
    "#001F11", "#204709", "#0C8558", "#FFD96A", "FF4533",
    "#1D1626", "#F2E0BD", "#BFAA8F", "#8C786C", "594C4C",
    "#685D47", "#913420", "#1E2729", "#C1D9C5", "FEEFB1",
    "#1D7561", "#FC8448", "#FF4138", "#A8282B", "38141B",
    "#BF0633", "#FF484E", "#FF9273", "#D1D0B4", "E5ECED",
    "#8E9E63", "#E6DBB0", "#F5EED7", "#C4BCA0", "176573",
    "#665446", "#809994", "#AECCB6", "#DEF2C4", "E6683F",
    "#3D0D26", "#660A3E", "#891C56", "#B0276F", "C93482",
    "#082136", "#00294D", "#004B8D", "#0068C4", "2998FF",
    "#3C4631", "#9A746F", "#F8A2AB", "#F1C6B3", "EAE9C0",
    "#FF534E", "#FFD7AC", "#BED194", "#499989", "176785",
    "#006D80", "#BDA44D", "#3C2000", "#84CECC", "78A419",
    "#352C2B", "#3C555C", "#9E9657", "#FFEBCD", "CD5510",
    "#2C3E50", "#FC4349", "#6DBCDB", "#D7DADB", "FFFFFF",
    "#523631", "#D1BE91", "#605E3A", "#4D462F", "592F39",
    "#18293B", "#5B5A56", "#F2DEA0", "#D0B580", "FFFBFF",
    "#C8DBB6", "#ECEBB7", "#CCC68A", "#B8B165", "827A5D ",
    "#7DA88C", "#EBE9A0", "#BED24B", "#859132", "35323C",
    "#E8574C", "#F27B29", "#E6A51B", "#D9CC3C", "399977",
    "#324032", "#B7C22C", "#FFFFE1", "#22A8B5", "2A3F42",
    "#B3A589", "#FFB896", "#FFF9B1", "#9AB385", "11929E",
    "#272433", "#343F4F", "#3D6066", "#77994D", "B2D249",
    "#250701", "#6D4320", "#B0925F", "#E7DEC0", "82ABB8",
    "#023550", "#028A9E", "#04BFBF", "#EFEFEF", "FF530D",
    "#594732", "#40342A", "#7A422E", "#D4CA9A", "EDE5AE",
    "#013C4D", "#BA5B22", "#DB913C", "#F0B650", "FAD46B",
    "#143840", "#5C6B63", "#A69E89", "#E0C297", "D96523",
    "#3FB8AF", "#7FC7AF", "#DAD8A7", "#FFB38B", "FF3F34",
    "#CA3995", "#F58220", "#FFDF05", "#BED73D", "61BC46",
    "#FFE1D0", "#FFBFB4", "#FF837E", "#FF4242", "BF1616",
    "#C4EEFF", "#7BA32D", "#094201", "#A41717", "C48726",
    "#001325", "#187072", "#90BD90", "#D7D8A2", "F2E4C2",
    "#1A4F63", "#068587", "#6FB07F", "#FCB03C", "FC5B3F",
    "#97B350", "#333230", "#736D61", "#BAAB90", "FFE5BA",
    "#403D33", "#807966", "#CCC2A3", "#8C0000", "590000",
    "#5F8A42", "#86AD59", "#F6FAA1", "#F28410", "D66011",
    "#BF355D", "#ED8168", "#FAB66A", "#F2DC86", "83BFA1",
    "#E1F03E", "#FFBA14", "#DB3A0F", "#A1003D", "630024",
    "#212226", "#45433F", "#687067", "#BDBB99", "F0EAC3",
    "#FE4365", "#FC9D9A", "#F9CDAD", "#C8C8A9", "83AF9B",
    "#293B47", "#5F7A87", "#FFFFFF", "#CBFF48", "00ADA9",
    "#282A33", "#697371", "#FFE7A6", "#F5BA52", "FA8000",
    "#0C304A", "#2B79A1", "#F3F4F1", "#85A71E", "BFD841",
    "#008B83", "#4DAE83", "#A0AE79", "#FFE499", "FF665E",
    "#5D7359", "#E0D697", "#D6AA5C", "#8C5430", "661C0E",
    "#324452", "#97BDBF", "#F2DFBB", "#F28705", "BF3604",
    "#EEEFB9", "#6ACFAE", "#369C93", "#232928", "B03831",
    "#332F45", "#015770", "#2A8782", "#9FD6AE", "FFFED2",
    "#2B2830", "#5C504F", "#ABAB8E", "#D9D7A3", "C7BE88",
    "#DC941B", "#EDC266", "#B6952C", "#E1D3A6", "E9A119",
    "#00305A", "#00448D", "#0074D9", "#4192D9", "7ABAF2",
    "#344459", "#485F73", "#5DA6A6", "#A9D9CB", "F2EAD0",
    "#060719", "#4D1B2F", "#9E332E", "#EB6528", "FC9D1C",
    "#96CEB4", "#FFEEAD", "#FF6F69", "#FFCC5C", "AAD8B0",
    "#05F2F2", "#04BFBF", "#EEF1D9", "#A60201", "7E100E",
    "#E6F1F5", "#636769", "#AAB3B6", "#6E7476", "4B4E50",
    "#DA0734", "#F1A20D", "#4AABB1", "#FCF3E7", "3F1833",
    "#202D44", "#FC4349", "#6DBCDB", "#D7DADB", "FFFFFF",
    "#CC3B37", "#398899", "#FFFCE8", "#FF857F", "CCC1A3",
    "#5DBEA9", "#EFEDDF", "#EF7247", "#4E3F35", "D1CBBA",
    "#FFC62D", "#E49400", "#DD5200", "#EFE38A", "91B166",
    "#B67D14", "#F2921F", "#F0B23E", "#A62409", "441208",
    "#C71B1B", "#D6BA8A", "#017467", "#E08F23", "0B0D0C",
    "#474143", "#A69E9D", "#E7E2DA", "#FFFFFF", "E7E8E7",
    "#435772", "#2DA4A8", "#FEAA3A", "#FD6041", "CF2257",
    "#6DD19D", "#99E89D", "#D0E8A1", "#FFF9C0", "D40049",
    "#FAF1D5", "#DEC9AC", "#CCA18B", "#11282D", "A5C4BB",
    "#000000", "#141414", "#1C1919", "#1A1716", "24201F",
    "#D5D8DD", "#5CA2BE", "#135487", "#2A4353", "989DA4",
    "#73161E", "#BF0F30", "#BFB093", "#037F8C", "0A2140",
    "#195962", "#F56F6C", "#FFFFFF", "#252932", "191C21",
    "#F8EFB6", "#FEBAC5", "#6CD1EA", "#FACFD7", "C2EAE9",
    "#91D6BC", "#768C6A", "#755F31", "#B37215", "FFBA4B",
    "#F2E6BB", "#DD4225", "#202724", "#63BD99", "F8FDD8",
    "#762B1B", "#807227", "#CCBF7A", "#FFEF98", "60B0A1",
    "#707864", "#C1D74E", "#F5FF7C", "#DFE6B4", "A6B89C",
    "#FFF3D2", "#97B48F", "#E87657", "#FF9B6F", "E8D495",
    "#33262E", "#733230", "#CC5539", "#E6D27F", "86A677",
    "#122430", "#273E45", "#FFFCE2", "#EBD2B5", "E63531",
    "#30394F", "#FF434C", "#6ACEEB", "#EDE8DF", "FFFBED",
    "#0A3A4A", "#196A73", "#32A6A6", "#A1BF36", "C8D94A",
    "#FFF7CC", "#CCC28F", "#70995C", "#33664D", "142933",
    "#43464D", "#9197A6", "#D3DCF2", "#7690CF", "48577D",
    "#DFE0AF", "#A4BAA2", "#569492", "#41505E", "383245",
    "#B52841", "#FFC051", "#FF8939", "#E85F4D", "590051",
    "#473C35", "#A36D5C", "#9C968B", "#D9CEAD", "8A866A",
    "#DB4C39", "#2D3638", "#109489", "#44D487", "D0DB86",
    "#6F8787", "#AEC2AE", "#E6DFAE", "#B0B57B", "888F51",
    "#C8385A", "#FFCF48", "#ECEABE", "#1FCECB", "1CA9C9",
    "#42282E", "#75A48B", "#D9CFB0", "#DC9B74", "D6665A",
    "#362F2D", "#4C4C4C", "#94B73E", "#B5C0AF", "FAFDF2",
    "#98293A", "#B14A58", "#C86C6B", "#DE9D76", "EFC77F",
    "#C1D301", "#76AB01", "#0E6A00", "#083500", "042200",
    "#453F22", "#7A6B26", "#CCAD5C", "#A1191F", "4E1716",
    "#541E32", "#8E3557", "#88A33E", "#C2BD86", "F7F2B2",
    "#2B1B2E", "#54344D", "#FFFFD6", "#B89E95", "6E444F",
    "#6EC1A5", "#9FBEA6", "#F5D3A3", "#FF9F88", "FB7878",
    "#2F252C", "#D3CCB2", "#99AD93", "#6E6751", "5C3122",
    "#BE333F", "#F2E9CE", "#C8C5B1", "#939F88", "307360",
    "#F0F1F2", "#232625", "#647362", "#B3D929", "D2D9B8",
    "#FA2B31", "#FFBF1F", "#FFF146", "#ABE319", "00C481",
    "#09455C", "#527E7C", "#F5FFCC", "#E0EB6E", "C4D224",
    "#F2DA91", "#F2B950", "#F29D35", "#D96704", "BF4904",
    "#A2CFA5", "#E0E7AB", "#F5974E", "#E96B56", "D24344",
    "#150033", "#310D42", "#5C2445", "#AB6946", "FFCE4C",
    "#23A38F", "#B7C11E", "#EFF1C2", "#F0563D", "2E313D",
    "#FF2468", "#E0D4B1", "#FFFFE3", "#00A5A6", "005B63",
    "#65A683", "#218777", "#3F585F", "#47384D", "F53357",
    "#000623", "#28475C", "#4A6C74", "#8BA693", "F0E3C0",
    "#E65322", "#D19552", "#B8BF73", "#B6DB83", "FFF991",
    "#112F41", "#068587", "#6FB07F", "#FCB03C", "FC5B3F",
    "#C89B41", "#A16B2B", "#77312B", "#1C2331", "152C52",
    "#C24366", "#D9C099", "#FFF8D8", "#A8E0BA", "00ADA7",
    "#CC0000", "#006600", "#FFFFEC", "#9C9178", "6C644F",
    "#3D0319", "#720435", "#C1140E", "#FC5008", "32241B",
    "#CFC7A4", "#5A9E94", "#005275", "#002344", "A38650",
    "#FFEBC3", "#CC3A00", "#FF3600", "#FF851B", "800C00",
    "#EFC164", "#F3835D", "#F35955", "#286275", "00434C",
    "#E9F29D", "#B7C29D", "#878E8F", "#67617A", "51456B",
    "#445859", "#03A696", "#49C4BE", "#F1F2E4", "FF7746",
    "#FA726C", "#FFD794", "#BAD174", "#3BA686", "5F6F8C",
    "#4D2B1F", "#635D61", "#7992A2", "#97BFD5", "BFDCF5",
    "#CC4D00", "#E6CF73", "#668059", "#264D4D", "00CCB3",
    "#4385F5", "#DC4437", "#FCBE1F", "#109D59", "FFFFFF",
    "#271F2E", "#A4A680", "#F2EBC9", "#D9B166", "A66B38",
    "#0B2C3C", "#FF6666", "#DADFE1", "#FFFFFF", "444444",
    "#CFF09E", "#A8DBA8", "#79BD9A", "#3B8686", "0B486B",
    "#302B26", "#A6B827", "#EDE9DD", "#98D3D4", "594E7A",
    "#4B0505", "#720707", "#BFB694", "#004659", "00292B",
    "#B52C38", "#EBD1B0", "#536682", "#D9964B", "DE6846",
    "#F2F1DF", "#F2B705", "#F2C84B", "#BF820F", "734002",
    "#26140C", "#3D2216", "#784E3D", "#AB8574", "D6BCB1",
    "#26221D", "#8C2C0F", "#E6E5B8", "#BFB38D", "402D1F",
    "#1F8181", "#F2BC79", "#F28972", "#BF1B39", "730240",
    "#002635", "#013440", "#AB1A25", "#D97925", "EFE7BE",
    "#8EC447", "#FFFFFF", "#96D3D4", "#636466", "2D2D2E",
    "#2D1E1E", "#4B3C37", "#96A576", "#CDE196", "FFFFBE",
    "#F06060", "#FA987D", "#F7F2CB", "#72CCA7", "10A296",
    "#1D8281", "#44BF87", "#FBD258", "#F29A3F", "DB634F",
    "#DEDE91", "#EF9950", "#F34E52", "#C91452", "492449",
    "#6D8EAD", "#1F3447", "#1A0B07", "#362416", "CFCDB4",
    "#00CD73", "#008148", "#2D9668", "#3ECD8E", "004E2C",
    "#3D8080", "#628282", "#858383", "#A38282", "C28080",
    "#475159", "#839795", "#B2BDB7", "#CCC9C0", "F2F2F2",
    "#0E6870", "#C6B599", "#C65453", "#FFDDB4", "EDAA7D",
    "#CEF0B7", "#A8DBA8", "#79BD9A", "#3B8686", "0B486B",
    "#292C44", "#FF5349", "#F0F0F1", "#18CDCA", "4F80E1",
    "#272A2B", "#383737", "#473B39", "#692B28", "940500",
    "#D6C274", "#DB9E46", "#25706B", "#3D2423", "AB362E",
    "#FFA68F", "#FF4867", "#FFF9C8", "#B5EBB9", "18B29D",
    "#A1A16A", "#727D59", "#366353", "#133C40", "03212E",
    "#D45354", "#A9DC3A", "#2FCAD8", "#818B85", "CDCDC1",
    "#F14B6A", "#3D3C3E", "#22BDAF", "#BAD7D4", "F4F4F4",
    "#FFE2C5", "#FFEEDD", "#FFDDAA", "#FFC484", "FFDD99",
    "#9FFF4A", "#1ABF93", "#087363", "#004040", "2F1933",
    "#FFDB97", "#B28F4E", "#FFFDFB", "#466CB2", "97BBFF",
    "#991C00", "#E09A25", "#FFFCDB", "#008B83", "262B30",
    "#44281A", "#00ACAE", "#F5EFD5", "#F37606", "EE4717",
    "#FF5952", "#FCEEC9", "#96D6D9", "#4FAAC9", "176075",
    "#5C4B51", "#8CBEB2", "#F2EBBF", "#A5C88F", "EF847B",
    "#105F73", "#F7F3B2", "#C6CC33", "#F28322", "CC5404",
    "#137072", "#56B292", "#B7F5AB", "#FBFFC0", "BF223D",
    "#E3F23E", "#6C821C", "#A6A53F", "#E0E0AC", "33302E",
    "#00215E", "#003CAA", "#1967F7", "#5E4000", "AA7400",
    "#273A3D", "#54695C", "#AD9970", "#FFBF87", "FF8F60",
    "#FFAA00", "#C2B93E", "#808F5D", "#576157", "302F30",
    "#BE1405", "#F2DCAC", "#AABEAA", "#736E41", "413C2D",
    "#6B1229", "#C76A61", "#FAB99A", "#F7D9B5", "CCB1A7",
    "#2D9993", "#58B3A3", "#83BFA3", "#B0D9A8", "FFFCB6",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF5A49",
    "#F30B55", "#010326", "#012840", "#54717F", "F2E6CE",
    "#2A3411", "#73662C", "#BC9847", "#FFDFB2", "6B0031",
    "#637D74", "#403D3A", "#8C3B3B", "#AB6937", "D4A960",
    "#010A26", "#011640", "#B6D6F2", "#FFFFFF", "E83338",
    "#924847", "#EB986C", "#E4C678", "#9C7885", "372C2C",
    "#022440", "#3F95AA", "#4EC6DE", "#EAE2DF", "F7572F",
    "#2B1D2E", "#323657", "#076473", "#54B087", "D6F567",
    "#052229", "#004043", "#BCC373", "#E3FF55", "D0D90C",
    "#4C514A", "#907A62", "#879796", "#755854", "B09880",
    "#1D2939", "#1CAF9A", "#FFFFFF", "#EE4F4B", "D1DC48",
    "#004B67", "#41CCB4", "#FFEA95", "#FF7C5D", "C70151",
    "#C0272D", "#FCFBE7", "#9FD3DA", "#008C9A", "05484F",
    "#213130", "#FF5E3D", "#C9C83E", "#FDFFF1", "559398",
    "#B1E4FC", "#366D78", "#39D5F1", "#FFFFFF", "D9FF03",
    "#DECE6C", "#FCF9B6", "#BFE3B5", "#5D826E", "262E2B",
    "#520A17", "#668F91", "#F5E6AC", "#AB8E5B", "52301C",
    "#2D3032", "#DD5F18", "#FBA922", "#F7F7F7", "404333",
    "#0C2538", "#2B434F", "#638270", "#BCC98E", "EDE059",
    "#E85066", "#F28E76", "#E6CEB0", "#5A8C81", "382837",
    "#BF2633", "#A6242F", "#D9CEAD", "#C0B18F", "011C26",
    "#002A4A", "#17607D", "#FFF1CE", "#FF9311", "E33200",
    "#0A8B91", "#485956", "#C4B98F", "#FFF9BC", "EEDF2E",
    "#B89A7B", "#9BBAAC", "#F2D649", "#D95D50", "DBDBDB",
    "#BD7938", "#8D4421", "#643001", "#532700", "3A1C00",
    "#E1E6FA", "#C4D7ED", "#ABC8E2", "#375D81", "183152",
    "#2E4259", "#F7483B", "#ECF0F1", "#03C8FA", "737373",
    "#364656", "#5D6B74", "#94A4A5", "#F2F5E9", "FF8C31",
    "#3E5916", "#93A605", "#F28705", "#F25C05", "E5EFFA",
    "#248077", "#74AD8D", "#C82754", "#F7BB21", "F9E2B7",
    "#20736A", "#8BD9CA", "#B1D95B", "#93A651", "403E34",
    "#D74B4B", "#DCDDD8", "#475F77", "#354B5E", "FFFFFF",
    "#252F33", "#415C4F", "#869C80", "#93C2CC", "CEEAEE",
    "#012840", "#79C7D9", "#9BF2EA", "#497358", "9DBF8E",
    "#EE7E94", "#F8B4C4", "#C7CAC9", "#D8505C", "41424",
    "#282828", "#505050", "#FFFFFF", "#2DCEDB", "F20000",
    "#004358", "#1F8A70", "#BEDB39", "#FF5347", "FD7400",
    "#470C3B", "#802F56", "#C0576F", "#E38679", "FFBD83",
    "#573328", "#B05A3A", "#FF8548", "#29332E", "0F1B1C",
    "#461F2D", "#E1FFBB", "#BAD47F", "#849C23", "52533F",
    "#333A40", "#4C5E5E", "#ADD0E5", "#CDE4FF", "729EBF",
    "#DE5605", "#F7A035", "#B1DEB5", "#EFECCA", "65ABA6",
    "#76D6D2", "#F9E270", "#EF6F56", "#F4EED8", "596B56",
    "#403E3F", "#F2F2F2", "#D9D9D9", "#9DAABB", "8C8C8C",
    "#059E9A", "#F4F2ED", "#F5A243", "#DB3E3B", "585857",
    "#FFBF41", "#EE8943", "#C02221", "#FFF4D3", "249CA9",
    "#024E76", "#39A6B2", "#FCE138", "#F5B824", "F08106",
    "#FF0067", "#FF3D6A", "#E7FF04", "#9CFF00", "56FF00",
    "#003540", "#0D3F40", "#487360", "#8FA671", "F2D795",
    "#FF493C", "#FFFFFF", "#B3ECEF", "#31C4F5", "ADEB41",
    "#244358", "#4A8B87", "#7CBCAE", "#F0D4AF", "C5252B",
    "#EA5930", "#F8AF1E", "#F5E5C0", "#097380", "372560",
    "#A1DBB2", "#FEE5AD", "#FACA66", "#F7A541", "F45D4C",
    "#2C4A47", "#6C9A7F", "#BB523D", "#C89D11", "81810B",
    "#F0F1F2", "#232625", "#647362", "#FF5629", "D2D9B8",
    "#7C9B5F", "#B8D197", "#E3FFF3", "#9BDEC7", "568F84",
    "#E54E45", "#DBC390", "#F2F2EF", "#13A3A5", "403833",
    "#77A7FB", "#E57368", "#FBCB43", "#34B67A", "FFFFFF",
    "#001A2E", "#8F0000", "#FFFFFF", "#8A874B", "41594F",
    "#312F40", "#49A69C", "#EFEAC5", "#E89063", "BF5656",
    "#047C8C", "#018B8D", "#F3BF81", "#F49B78", "F1706D",
    "#00303E", "#7096AD", "#C1D1DE", "#FFF9EF", "EC4911",
    "#2D6891", "#70A0BF", "#F5EEDC", "#DC4C1A", "F0986C",
    "#040002", "#3D1309", "#E8B96A", "#BC5D15", "5C0F00",
    "#8B929C", "#5E6070", "#514454", "#3B313D", "FF2479",
    "#142D58", "#447F6E", "#E1B65B", "#C8782A", "9E3E17",
    "#22104D", "#2D1E5E", "#483A85", "#7067AB", "A49CFA",
    "#919C86", "#9E373E", "#2B2E36", "#D1B993", "C45A3B",
    "#332F45", "#015770", "#2A8782", "#9FD6AE", "FFFED2",
    "#37C78F", "#FEE293", "#FF4D38", "#CC2249", "380C2A",
    "#47282C", "#8C8468", "#C9B37F", "#DBDAB7", "C4C49C",
    "#14191A", "#2D2B21", "#A69055", "#CCB287", "FFB88C",
    "#F5E3CD", "#696158", "#B6A898", "#877D71", "504A43",
    "#005151", "#009393", "#F56200", "#454445", "969692",
    "#D95F47", "#FFF2C1", "#80A894", "#106153", "072C36",
    "#9E352C", "#E6E8A9", "#93C28C", "#2E5A5C", "2B2623",
    "#03013A", "#334A94", "#6B9EDF", "#83C3F2", "99E6FF",
    "#372A26", "#4D4D4D", "#6DA0A7", "#9ED5A8", "C7F5FF",
    "#03658C", "#022E40", "#F2B705", "#F28705", "F25C05",
    "#FF3B16", "#E87826", "#E8BA4A", "#80A272", "003045",
    "#00748E", "#E3DFBB", "#F4BA4D", "#E3753C", "DA3B3A",
    "#25401E", "#56732C", "#84A63C", "#B8D943", "EAF2AC",
    "#449BB5", "#043D5D", "#EB5055", "#68C39F", "FFFCF5",
    "#108F97", "#FF8B6B", "#FFE39F", "#16866D", "103636",
    "#1A4F63", "#068F86", "#6FD57F", "#FCB03C", "FC5B3F",
    "#381C19", "#472E29", "#948658", "#F0E99A", "362E29",
    "#D7E8F7", "#BBD0E3", "#9CB7CF", "#6A8BAB", "375D81",
    "#0F1C28", "#136972", "#67BFA7", "#F3CF5B", "F07444",
    "#FFFFFF", "#4EA9A0", "#969514", "#FE9C03", "FCDE8E",
    "#2F2D30", "#656566", "#65537A", "#51386E", "2A2333",
    "#4C2916", "#F05A28", "#FBAF3F", "#38B449", "FFFFFF",
    "#132537", "#006C80", "#EBCAB8", "#FE8315", "FA3113",
    "#ECEEE1", "#A8DACF", "#F05B4F", "#D8403A", "221E1F",
    "#00305A", "#004B8C", "#0074D9", "#4192D9", "7ABAF2",
    "#72CF3F", "#85FF00", "#23E000", "#2FB81B", "00FF1C",
    "#45CEEF", "#FFF5A5", "#FFD4DA", "#99D2E4", "D8CAB4",
    "#FF5B00", "#A1716C", "#728296", "#439AAB", "00CABD",
    "#EB6C2D", "#D9C8A2", "#939C80", "#496158", "232F38",
    "#D94214", "#FFF2C1", "#80A894", "#52736B", "093844",
    "#4D1B2F", "#9E332E", "#EB6528", "#FC9D1C", "FFCA50",
    "#FFEEB0", "#9AE8A4", "#C7C12D", "#F76245", "ED1C43",
    "#FFFAED", "#D4DBFF", "#879AC9", "#242942", "FF8800",
    "#022840", "#013440", "#517360", "#9DA67C", "F2DC99",
    "#331A0F", "#519994", "#BA4B3C", "#EEDDAA", "789F63",
    "#577867", "#EDCE82", "#D68644", "#AB3229", "662845",
    "#435A66", "#88A6AF", "#F5F2EB", "#D9CDB8", "424342",
    "#FF8840", "#958D4F", "#737B55", "#595540", "513E38",
    "#9D805A", "#EBC99D", "#FFE6C5", "#9DCEEA", "4B809E",
    "#272D40", "#364659", "#55736D", "#9DBF8E", "D0D991",
    "#23A38F", "#B7C11E", "#EFF1C2", "#F0563D", "2E313D",
    "#98C000", "#3D4C53", "#EA2E49", "#FFE11A", "0CDBE8",
    "#A20E30", "#E93C4F", "#DCDCD4", "#ADBCC3", "2D4255",
    "#1C2640", "#263357", "#384C80", "#4E6AB3", "5979CD",
    "#D94214", "#FFF2C1", "#80A894", "#52736B", "093844",
    "#3B596A", "#427676", "#3F9A82", "#A1CD73", "ECDB60",
    "#1E1E1F", "#424143", "#67666A", "#807F83", "CBC9CF",
    "#E04946", "#3BA686", "#B6D15D", "#FFD495", "FA847E",
    "#FFEBB0", "#FFB05A", "#F84322", "#C33A1A", "9F3818",
    "#FFA136", "#FF814A", "#E6635A", "#785D6B", "534557",
    "#CDCF91", "#EBEACC", "#D6D5B8", "#6D7D80", "41545E",
    "#011526", "#011C40", "#4E8DA6", "#F2EA79", "F2B33D",
    "#353230", "#3F4E51", "#7B8F70", "#99B2BE", "F6F4EA",
    "#063559", "#0D8C7F", "#8FBF4D", "#F2D13E", "D95929",
    "#158000", "#199900", "#20BF00", "#24D900", "29FF00",
    "#0B0D0E", "#137074", "#7EB7A3", "#F1DDBB", "EC6766",
    "#02151A", "#043A47", "#087891", "#C8C8C8", "B31D14",
    "#59361F", "#5C992E", "#A3CC52", "#E6E673", "FF5933",
    "#FE4365", "#FC9D9A", "#F9CDAD", "#C8C8A9", "83AF9B",
    "#4B1E18", "#F9E5C2", "#BBB082", "#829993", "4F5D4E",
    "#032843", "#1F595B", "#508C6D", "#71A670", "A6DB89",
    "#191724", "#4C4547", "#8C594E", "#D18952", "FDB157",
    "#191919", "#182828", "#60702D", "#AAB232", "E6FA87",
    "#212A3F", "#434F5B", "#F2F2F2", "#8AB839", "2E2E2E",
    "#004158", "#026675", "#038B8B", "#F1EEC9", "F09979",
    "#023059", "#3F7EA6", "#F2F2F2", "#D99E32", "BF5E0A",
    "#F21E52", "#FFFFFF", "#3D3B42", "#0C6F73", "63CFD4",
    "#452743", "#E7635E", "#F8E9A8", "#89E0AD", "00928C",
    "#FAAD63", "#D1714D", "#785E48", "#39403B", "3D1C24",
    "#4C0016", "#FFF7EB", "#DCCEA7", "#A17345", "104F53",
    "#BF2431", "#F24150", "#2A4557", "#3B848C", "EFF2E4",
    "#3B3013", "#8F6031", "#E88833", "#9C0C0A", "FDF3C1",
    "#1E2422", "#88BEB1", "#FF006D", "#DAFFFF", "718A94",
    "#F1F4F7", "#AF9F7B", "#775E43", "#40413C", "251C17",
    "#00182E", "#0C6BA1", "#D4D6D4", "#FFFDEB", "FF7500",
    "#FFAB4A", "#CCBAAB", "#1E2129", "#3D5E6E", "47A3A3",
    "#66B3A7", "#C0D4B6", "#EEF0BD", "#F0563D", "2C2F3B",
    "#332525", "#907465", "#EDC5B5", "#878C6D", "63674A",
    "#F04C16", "#DBDBD0", "#EDBD1F", "#4CB09C", "313B4A",
    "#2B211D", "#611C26", "#C5003E", "#8EB7A8", "F1E4B7",
    "#1A1F2B", "#30395C", "#4A6491", "#85A5CC", "D0E4F2",
    "#03497E", "#0596D5", "#9DEBFC", "#999999", "FE4B28",
    "#2F4159", "#465E73", "#88A649", "#F2ECE4", "D98841",
    "#323A46", "#22282F", "#EB4A33", "#FFFFFF", "E9F0F5",
    "#2C3E50", "#FC4349", "#6DBCDB", "#D7DADB", "FFFFFF",
    "#F29727", "#E05723", "#B0382F", "#982E4B", "713045",
    "#4D584A", "#465943", "#428552", "#3E754E", "4C694B",
    "#47191C", "#59574B", "#829690", "#B5B09A", "E1E3CB",
    "#1D5123", "#B1C661", "#FFDA68", "#FE9257", "F64448",
    "#59323C", "#260126", "#F2EEB3", "#BFAF80", "8C6954",
    "#4E0805", "#9E0522", "#FFF4D4", "#B8C591", "447622",
    "#424862", "#FB9A63", "#BFC4D5", "#F6FBF4", "FEBC98",
    "#FF2468", "#E0D4B1", "#FFFFE3", "#00A5A6", "005B63",
    "#1C2F40", "#4C6173", "#8094A6", "#D9D1BA", "F2E9D8",
    "#DFD7B7", "#EB7707", "#5C5445", "#3B2323", "9CBFC7",
    "#262E3B", "#9C8878", "#CFCAAA", "#FBF8FF", "992435",
    "#FFBC67", "#DA727E", "#AC6C82", "#685C79", "455C7B",
    "#404A69", "#516C8A", "#8AC0DE", "#FFFFFF", "FFAC00",
    "#485B61", "#4B8C74", "#74C476", "#A4E66D", "CFFC83",
    "#A31180", "#C42795", "#DE52B4", "#EA88CE", "FFBFE5",
    "#E64D2E", "#FFF5F1", "#7893AD", "#576B9C", "2D2A52",
    "#BF0436", "#8C0327", "#590219", "#F2CBA1", "8C674C",
    "#CF5B6F", "#FFF8C8", "#CAD9B1", "#8FB3A0", "648991",
    "#341D44", "#744D90", "#BB8CDD", "#3E4417", "88904D",
    "#00293E", "#003D4E", "#006269", "#00918F", "00BAB5",
    "#43212E", "#D9666F", "#F2D57E", "#A9A688", "516057",
    "#2A3B30", "#ABFFD1", "#EBFFF5", "#9DFEFF", "273B40",
    "#A63343", "#E65159", "#F5E9DB", "#F4F7CF", "BAD984",
    "#1BA68C", "#54BFAC", "#F2EDA7", "#F2E530", "D94625",
    "#1A2A40", "#3F7369", "#F2DEA0", "#CE5251", "EA895E",
    "#1E9382", "#70A758", "#EFF1C2", "#F0563D", "2E313D",
    "#A991E8", "#FFB4BB", "#ACF7FF", "#A2E891", "FFEDAE",
    "#225B66", "#17A3A5", "#8DBF67", "#FCCB5F", "FC6E59",
    "#282624", "#BFB7AA", "#403D39", "#807A71", "ABA398",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF4949",
    "#440008", "#605521", "#988432", "#D9A54E", "9E3711",
    "#649670", "#36291E", "#69AD6C", "#92E67C", "C5FF84",
    "#42342C", "#738076", "#B2B39B", "#DFE5E1", "294359",
    "#1A3838", "#3F7A51", "#82A352", "#D1C062", "FFBE59",
    "#7D8C22", "#B3BF67", "#F2E49B", "#D9DFF4", "6791BF",
    "#8A7D6D", "#2D2D38", "#E86E48", "#FFFFE8", "9CC9C9",
    "#CFC949", "#FFF5BF", "#A9E6C4", "#6AB39F", "665841",
    "#A1172D", "#FDFFBA", "#A7DB9E", "#275C57", "1F1B19",
    "#FF6C0D", "#F29E00", "#E6C10F", "#44996F", "216273",
    "#2C3E50", "#FA4248", "#D7DADB", "#6DBCDB", "FFFFFF",
    "#627369", "#99B397", "#E2F2C6", "#91CCAD", "376266",
    "#04496E", "#66CAFF", "#A3FC7E", "#70D44A", "2C6B0F",
    "#1BA68C", "#97BF3F", "#F2ECD8", "#F2B035", "F2522E",
    "#A2D9B1", "#7CBF9E", "#F2F1B9", "#8C8575", "193741",
    "#024959", "#037E8C", "#F2EFDC", "#E74C30", "363636",
    "#212625", "#9CA6A2", "#D0D9D6", "#BF0404", "C2C6AF",
    "#00FFFF", "#00FF00", "#FFFF00", "#FF5100", "FF007C",
    "#212629", "#CDCF19", "#FFF77D", "#96C4AB", "CF2A56",
    "#CFF9FF", "#BFC7BB", "#787051", "#332730", "57324F",
    "#98CACB", "#FDEFBE", "#F0542B", "#736E5B", "ABA68E",
    "#F2F1EB", "#BFB9A4", "#262222", "#802A30", "8C0303",
    "#65356B", "#AB434F", "#C76347", "#FFA24C", "519183",
    "#78BF82", "#A4D17C", "#CFD96C", "#EBD464", "FFD970",
    "#806265", "#FFA256", "#F7DD77", "#E0D054", "ABA73C",
    "#8F323C", "#123943", "#80BDDB", "#4189AB", "C98127",
    "#683820", "#8C9A89", "#E7D6A2", "#BEAA65", "9A8234",
    "#021B21", "#032C36", "#065F73", "#E8DFD6", "FF2A1D",
    "#2D6C73", "#3FA693", "#B4D9CB", "#9ABF49", "C6D93B",
    "#141F26", "#2B4040", "#405950", "#A69E86", "F2D9BB",
    "#4A8279", "#003330", "#610400", "#003B06", "02730F",
    "#69B5E1", "#D4E4F5", "#EAF2F8", "#BEDBED", "000000",
    "#893660", "#EF7261", "#68D693", "#A0D7E2", "299CA8",
    "#073A59", "#2D9AA6", "#F2E2DC", "#F23322", "A61B1B",
    "#2A3A48", "#3E6372", "#B2D4DC", "#FAFAFF", "FF6900",
    "#F3BD8D", "#F1A280", "#BE6D6B", "#704A5B", "3E263C",
    "#1C2742", "#3C91C7", "#5A9ABE", "#95C5DE", "E0EEFB",
    "#426261", "#465A59", "#577573", "#739A97", "9AC1C0",
    "#002A4A", "#17607D", "#FFF1CE", "#FF9311", "D64700",
    "#589373", "#BFBD99", "#F2D6B3", "#C2512F", "241E1E",
    "#1F518B", "#1488C8", "#F7E041", "#E2413E", "B5292A",
    "#549494", "#E85649", "#232C2E", "#E6E8D2", "706558",
    "#392133", "#FFECBE", "#D9D098", "#C4AB6D", "AB7D3A",
    "#F0F0F0", "#1C1C1C", "#A2FDF5", "#1CCDC7", "27EDDF",
    "#011526", "#025959", "#027353", "#03A678", "03A696",
    "#004358", "#1F8A70", "#BEDB39", "#FFE11A", "FD7400",
    "#37465D", "#F2F2F2", "#9DC02E", "#779324", "051A37",
    "#580022", "#AA2C30", "#FFBE8D", "#487B80", "011D24",
    "#F9F9F9", "#03A678", "#E9EDEB", "#F44647", "00707F",
    "#800000", "#BF0000", "#E2D6C2", "#F6EDD8", "FFFFFF",
    "#F7F6AF", "#1B2124", "#D62822", "#97D6A6", "468263",
    "#432852", "#992255", "#FF3D4C", "#28656E", "00968F",
    "#444344", "#52BBB2", "#2B344D", "#EE5555", "F8F7EE",
    "#45334A", "#796B7D", "#CCC4B0", "#FFF1B5", "FFA3A3",
    "#5A4B53", "#9C3C58", "#DE2B5B", "#D86A41", "D2A825",
    "#14151C", "#0C242B", "#297059", "#84D66E", "D1FB7A",
    "#272D40", "#364659", "#55736D", "#9DBF8E", "D0D991",
    "#23A38F", "#B7C11E", "#EFF1C2", "#F0563D", "2E313D",
    "#2E064D", "#80176B", "#B356A1", "#59580B", "FFFF00",
    "#CC3333", "#FF9D33", "#F7F7F0", "#3EBBA7", "00747A",
    "#5C4B51", "#8CBEB2", "#F2EBBF", "#F3B562", "BD6060",
    "#0D3E58", "#1C848C", "#19C0C2", "#F3EDD6", "DA6260",
    "#022629", "#2A5945", "#FAFFED", "#E6DCC0", "B3371C",
    "#F4FAC7", "#7BAD8D", "#FFB159", "#F77F45", "C2454E",
    "#A2C1C6", "#86B1B7", "#AECBAD", "#CFDCB0", "D6E1D1",
    "#B0DAFF", "#325B80", "#64B7FF", "#586D80", "5092CC",
    "#0F808C", "#6C8C26", "#F2A71B", "#F26A1B", "D91818",
    "#FFBC6C", "#FE9F6C", "#BD716E", "#74495F", "3B2C4D",
    "#FF4D41", "#F2931F", "#E6CA21", "#91B321", "1E8C65",
    "#302821", "#453629", "#5C4837", "#8A735F", "BDA895",
    "#415457", "#5F7B7F", "#9ACCAF", "#E6EBC4", "F9F7C8",
    "#474143", "#A69E9D", "#E7E2DA", "#FFFFFF", "E7E8E7",
    "#805939", "#BD9962", "#E6CD7D", "#578072", "2D4B4D",
    "#03588C", "#1763A6", "#419CA6", "#54BF83", "8DBF41",
    "#00CCFF", "#A1FCFF", "#040438", "#004878", "C9FAFF",
    "#534C64", "#B7DECF", "#F0F3D7", "#7E858C", "D96557",
    "#7F7364", "#CBB08E", "#CBC1B7", "#789DCB", "646F7F",
    "#5C2849", "#A73E5C", "#EC7263", "#FE9551", "FFD285",
    "#FF0012", "#FF7D00", "#FFD900", "#5BE300", "0084B0",
    "#F24C32", "#F29471", "#FCDFA6", "#36B898", "3D7585",
    "#083157", "#0A6C87", "#459C97", "#92CCA5", "C9F0B1",
    "#DC941B", "#EDC266", "#B6952C", "#E1D3A6", "E9A119",
    "#323836", "#BAD1B5", "#DBE8CF", "#F0F7E8", "FFFEF5",
    "#081724", "#589494", "#8EBBB4", "#D0DCD0", "F5EED2",
    "#50781C", "#9CAD1C", "#EAF7E6", "#40A5DE", "0B5191",
    "#537F79", "#78A68F", "#CBD49C", "#FED457", "CB252A",
    "#F23C13", "#CBAB78", "#FFFFFF", "#898373", "1F1C17",
    "#450003", "#5C0002", "#94090D", "#D40D12", "FFED75",
    "#0770A2", "#82D9F7", "#FEFEFE", "#AEC844", "F36622",
    "#30394F", "#FF434C", "#6ACEEB", "#EDE8DF", "0E6569",
    "#FF6B6B", "#556270", "#C7F464", "#4ECDC4", "EDC8BB",
    "#D9B500", "#FFED9C", "#BFCC85", "#748F74", "454545",
    "#452E32", "#A34B1B", "#B5A187", "#EDDF9A", "A7CC31",
    "#2C2B33", "#596664", "#909980", "#CCC08D", "FF8A00",
    "#C21F1F", "#FFFFFC", "#E34446", "#FFFFDB", "E36D6F",
    "#282828", "#00AAB5", "#C1C923", "#F41C54", "F5F0F0",
    "#3A3F40", "#202627", "#151B1E", "#EFF4FF", "41444D",
    "#DEBB73", "#4D0017", "#010000", "#4D0F30", "9A002F",
    "#EB9328", "#FFA754", "#FFD699", "#FFF5DC", "4FA6B3",
    "#025E73", "#037F8C", "#D9D59A", "#D9BD6A", "590202",
    "#636266", "#E0CEA4", "#E8A579", "#7D6855", "42403E",
    "#FF0000", "#FF4000", "#FF7F00", "#FFBF00", "FFFF00",
    "#FFFFFF", "#74ADA6", "#1E5E6F", "#241B1F", "68A81E",
    "#5A0532", "#FF6745", "#FFC861", "#9DAE64", "27404A",
    "#ACCBBC", "#467847", "#E8E4C1", "#A60303", "730202",
    "#5C4B51", "#8CBEB2", "#F2EBBF", "#F3B562", "F06060",
    "#0D2557", "#93A8C9", "#FFFFFF", "#F5DED5", "558D96",
    "#F53C4A", "#565157", "#10CFC8", "#F2EEE7", "F5D662",
    "#FFD97B", "#E65029", "#A60027", "#660033", "191C26",
    "#595408", "#A6800D", "#A66D03", "#A63F03", "730C02",
    "#2E031F", "#590424", "#8C072B", "#BF0A2B", "DEEFC5",
    "#E0C882", "#A6874E", "#BFA169", "#D9B779", "F2D399",
    "#D88681", "#A67673", "#746566", "#535A5D", "324F54",
    "#FC297D", "#FB607A", "#FDA286", "#FDC188", "FEE78A",
    "#FFECA1", "#B3B27F", "#4C5E52", "#2F3436", "FFBE2C",
    "#D93312", "#B3AB82", "#45735F", "#394D47", "2C3233",
    "#324143", "#6595A3", "#C8E3E8", "#FCFFED", "B6C28B",
    "#477984", "#FEF5EB", "#C03C44", "#EEAA4D", "313E4A",
    "#334D5C", "#45B29D", "#EFC94C", "#E27A3F", "DF4949",
    "#630B11", "#33322F", "#2A2927", "#1E1D1C", "000000",
    "#D94214", "#FFF2C1", "#80A894", "#52736B", "093844",
    "#051E21", "#00302D", "#856434", "#F28C28", "FFAD4E",
    "#D7DADD", "#DDDEE3", "#E1E1E9", "#EDEFF4", "F2F3F8",
    "#BF495E", "#41A693", "#F2EC9B", "#D9CF48", "D9583B",
    "#067072", "#14A589", "#DECFA6", "#BAAE8C", "F94B06",
    "#423A38", "#47B8C8", "#E7EEE2", "#BDB9B1", "D7503E",
    "#730324", "#DFE3E6", "#B4C4D4", "#8BA2BD", "456382",
    "#537374", "#F9BD7F", "#EBD7A5", "#ADC9A5", "5C9E99",
    "#88B59E", "#B6DEC8", "#39464D", "#C04229", "ABD1AB",
    "#11A7FC", "#95D127", "#F2E415", "#FF8638", "EE3551",
    "#212640", "#5D718C", "#4B95A6", "#60BFBF", "EFF2D8",
    "#D8A64D", "#9B5422", "#351411", "#5B0D0D", "991C11",
    "#53324F", "#668D6E", "#F2E0A0", "#F19B7A", "F0756E",
    "#DFE0AF", "#A4BAA2", "#569492", "#41505E", "383245",
    "#7BBADE", "#93DE7F", "#FFED5D", "#F29E4A", "FF7050",
    "#133800", "#1B4F1B", "#398133", "#5C9548", "93E036",
    "#D9D7AD", "#91A685", "#FF6A00", "#37485C", "1C232E",
    "#008767", "#FFB27A", "#FF6145", "#AB2141", "5E1638",
    "#727B7F", "#CCEAEA", "#7A7556", "#2E2125", "44CACC",
    "#FFFFED", "#FF2C38", "#FF9A3A", "#FFF040", "67D9FF",
    "#007148", "#60A859", "#9BDA6A", "#C7F774", "F9FFEF",
    "#092740", "#45698B", "#90B0CC", "#F1FAFF", "8FD36F",
    "#E2FFA0", "#7D8076", "#FAFFED", "#C2CCBE", "8F7D70",
    "#00736A", "#00BC9F", "#F1EEC7", "#FEA301", "F2561A",
    "#26282E", "#AD5138", "#F7F7F7", "#DDDAE0", "8594AE",
    "#1A191F", "#35352F", "#484042", "#4E5252", "E64D38",
    "#49454A", "#E69B02", "#FAF4C6", "#B1D631", "324052",
    "#5F1A2B", "#1D2834", "#6F8B78", "#E4D49E", "C96466",
    "#012D3D", "#38AD9E", "#FFEB9E", "#FF6867", "D0DBED",
    "#0D1F36", "#104954", "#1E9C89", "#38CC85", "60EB7B",
    "#8C4E03", "#9FA66A", "#F2EC94", "#F23005", "8B0F03",
    "#000001", "#20201F", "#E2E2E4", "#590402", "B80000",
    "#344059", "#465973", "#F2D272", "#A69460", "595139",
    "#33454C", "#608F85", "#B6E5CB", "#8BAF95", "54584E",
    "#FBFEF6", "#B7BFA4", "#687F70", "#1A3841", "BF3847",
    "#D7E836", "#86FFC7", "#FFB048", "#E8366C", "593BFF",
    "#34A9FF", "#5982DB", "#665EB8", "#684682", "632E62",
    "#004056", "#2C858D", "#74CEB7", "#C9FFD5", "FFFFCB",
    "#BFB978", "#84945C", "#516967", "#4D3130", "281B24",
    "#103B73", "#20638C", "#3786A6", "#4EABBF", "EBEFF2",
    "#9FB1BF", "#1D2D63", "#1C5357", "#1F6E56", "196331",
    "#FFEBBA", "#C3BD91", "#88947B", "#4C3F3F", "2A2727",
    "#347373", "#4EA6A6", "#91D9D9", "#FFFFFD", "F2E205",
    "#828948", "#EFDFC2", "#006971", "#DC533E", "840000",
    "#000137", "#29003F", "#79003D", "#D04D14", "F89801",
    "#370005", "#4B0005", "#5F0005", "#730005", "870005",
    "#C3AE8D", "#F25260", "#2D5F73", "#6BADC9", "8FCED6",
    "#9E1B36", "#F7EDBA", "#E69B3D", "#EB3355", "3D241D",
    "#1D8281", "#44BF87", "#FBD258", "#F29A3F", "DB634F",
    "#035C75", "#1B808C", "#31A6A8", "#F3F1BC", "F3AD14",
    "#FF7500", "#665130", "#EBB643", "#CEDAA8", "668E84",
    "#384D3A", "#3E6653", "#728053", "#A68357", "D97C71",
    "#012326", "#17455C", "#E1CAAB", "#FE8333", "FA4913",
    "#1A2944", "#2DA7C7", "#56ACBA", "#98C4C9", "CBD5D2",
    "#BF3542", "#CDC5BA", "#EBE3D6", "#3C3C3C", "2E2E2E",
    "#231921", "#695F74", "#BEB4CB", "#EBEBF0", "D2DCEB",
    "#34373F", "#686C75", "#F3E9D0", "#BEB7A7", "8E867C",
    "#661510", "#D9351A", "#F2C76F", "#BF9727", "204D3F",
    "#3CFFEE", "#24AABC", "#356781", "#2C3D51", "1C1F24",
    "#DA3537", "#FFFCC4", "#00585F", "#6A6A61", "2A2C2B",
    "#AE3135", "#D1AF87", "#8C826B", "#3D3C33", "F2F0CE",
    "#FF0894", "#FF5E9F", "#FF91A7", "#FFB5CA", "F5F0BA",
    "#99878D", "#323232", "#646464", "#7E4A5C", "372129",
    "#3FB8AF", "#7FC7AF", "#DAD8A7", "#FFB38B", "FF3F34",
    "#402B3C", "#6AA6A6", "#D9CCA7", "#F2B263", "F26835",
    "#6AA690", "#F2BC1B", "#F2DC99", "#F29057", "BF1F1F",
    "#F4FAC7", "#7BAD8D", "#FFB158", "#F77F45", "C2454E",
    "#E5533C", "#F5E346", "#93D06D", "#50AC6A", "227864",
    "#39588A", "#A9BDD7", "#FFFFFF", "#FFEADD", "FFD0BB",
    "#B0B595", "#615F4F", "#828567", "#91A380", "EAFFCD",
    "#00427F", "#0066BD", "#66B5CC", "#F0E4C5", "D6C28F",
    "#FF6313", "#F9E4B3", "#C29689", "#74474B", "45232E",
    "#00585F", "#009393", "#FFFCC4", "#C7C49B", "EB0A00",
    "#091840", "#44A2FF", "#F7F7EA", "#B3CC63", "4C6620",
    "#5CBBE3", "#FCF1BC", "#5C8182", "#383A47", "B4F257",
    "#9E9E9E", "#E5E1D1", "#E0393D", "#253746", "425563",
    "#4D9453", "#FFFFB1", "#ADDE4E", "#FF9D27", "A62A16",
    "#B70046", "#FF850B", "#FFEBC5", "#109679", "675A4C",
    "#363636", "#0599B0", "#A4BD0A", "#FFA615", "FF2E00",
    "#7D8077", "#BBBFB2", "#FAFFED", "#E82A33", "E3DEBC",
    "#FD9F44", "#FC5C65", "#007269", "#03A679", "FAF0B9",
    "#134B57", "#81A489", "#F1D8B5", "#F2A054", "C04D31",
    "#946E49", "#394042", "#EDDBAC", "#872A0C", "BA8E3A",
    "#404040", "#024959", "#037E8C", "#FFFFFF", "F24C27",
    "#2A3342", "#163C6E", "#4E5F61", "#E6A015", "EDE7BE",
    "#445060", "#829AB5", "#849E91", "#C14543", "D6D5D1",
    "#8A9126", "#B7BF5E", "#FFE9C4", "#F5B776", "F58E45",
    "#9B2D1E", "#3C3A28", "#78A080", "#9BCD9E", "FFFFAE",
    "#FF6138", "#FFFF9D", "#BEEB9F", "#79BD8F", "00A388",
    "#990000", "#FF6600", "#FF9900", "#996633", "CC9966",
    "#DCE6DA", "#B8CCBB", "#98B3A5", "#7A9994", "62858C",
    "#0B1C29", "#3B7C8F", "#73A5A3", "#98C1B7", "F0EBD2",
    "#F6CB51", "#E25942", "#13A89E", "#3F4953", "F2E7DA",
    "#282F36", "#FFFEFC", "#BDA21D", "#BFBC5B", "D2E098",
    "#8C182D", "#DE7140", "#FCB95A", "#FAE285", "6A7349",
    "#6B9100", "#FFE433", "#FF841F", "#E03D19", "A6001C",
    "#FFEAA7", "#D9D697", "#9FC49F", "#718C6A", "543122",
    "#CFF09E", "#A8DBA8", "#79BD9A", "#3B8686", "0B486B",
    "#0C2233", "#065471", "#0A91AB", "#FFC045", "F2F2F2",
    "#BEE8E0", "#373C40", "#2E2621", "#73320B", "FF5E00",
    "#1B2C35", "#A3BFC6", "#FF005D", "#222A30", "293A42",
    "#FF8400", "#3B4044", "#494948", "#E6E1D8", "F7F2E9",
    "#6A482D", "#518C86", "#F6BF3D", "#EF7C27", "BF2424",
    "#261C2B", "#292B39", "#226468", "#608D80", "829D8F",
    "#B2AD9A", "#110E00", "#363226", "#A9A695", "ECE9D8",
    "#1B1B26", "#26394D", "#286480", "#13B3BF", "A3FF57",
    "#F2C2A7", "#F5E5C5", "#593D28", "#422C21", "93DEDB",
    "#001028", "#033140", "#1E5A5B", "#7BA78C", "EBEDC6",
    "#544E6E", "#808CB0", "#ABD1D9", "#D9FFF7", "DDF556",
    "#323A45", "#596677", "#758194", "#FFFFFF", "E74C3C",
    "#45291A", "#AB926D", "#DBD1BC", "#4999C3", "5FCBEC",
    "#6B151D", "#2E1615", "#A8553A", "#DB8F5A", "F2C18E",
    "#000623", "#28475C", "#4A6C74", "#8BA693", "F0E3B1",
    "#60807B", "#81B37A", "#BCCC5F", "#FFEE65", "E64964",
    "#FFFFFA", "#A1A194", "#5B605F", "#464646", "FF6600",
    "#1E1B17", "#577270", "#9C9A79", "#C7BDA1", "580E0C",
    "#452F27", "#5E504A", "#6B6865", "#9BBAB2", "B0FFED",
    "#1B5257", "#F7F6C3", "#F28159", "#CC5850", "4F1C2E",
    "#FAA51B", "#BF511F", "#2C445E", "#2F6D82", "5EE4EB",
    "#BF3952", "#59364A", "#556D73", "#D9D1A9", "D95F5F",
    "#024959", "#037E8C", "#F2EFDC", "#E74C30", "363636",
    "#221A26", "#544759", "#A197A6", "#F27405", "D93D04",
    "#C4A44A", "#E6D399", "#9AB8A9", "#7C8A7F", "4E4B44",
    "#FFFEC8", "#B1BF99", "#5B604D", "#39382B", "26181E",
    "#4E3C51", "#21A68D", "#3BBF9A", "#F2E8B6", "F25749",
    "#102144", "#1B325E", "#254580", "#3C63B0", "5D8AEA",
    "#2A3A48", "#3E6372", "#B2D4DC", "#FAFAFF", "FF4B00",
    "#FFF1BF", "#F20058", "#FFAEAC", "#000001", "7D7A96",
    "#FDFFC6", "#F2F096", "#FF0080", "#DE0049", "521218",
    "#5B0E00", "#FBB500", "#FBD864", "#807D1A", "59233C",
    "#1E1E1F", "#424143", "#67666A", "#807F83", "CBC9CF",
    "#3C3658", "#3EC8B7", "#7CD0B4", "#B9D8B1", "F7E0AE",
    "#FFFFFF", "#99B75F", "#D5DD98", "#EBF4DB", "D8D8D8",
    "#248A8A", "#C9FA58", "#F9E555", "#FAAC38", "F2572A",
    "#086B63", "#77A490", "#E2D8C1", "#BFAE95", "7C7159",
    "#5C4B51", "#8CBEB2", "#F2EBBF", "#A5C88F", "EF847B",
    "#17162F", "#89346D", "#C76058", "#FFB248", "E8C475",
    "#6E8F4A", "#65D9C5", "#F2E7B6", "#EDA430", "AB3E2C",
    "#30394F", "#FF434C", "#6ACEEB", "#EDE8DF", "0E6569",
    "#8E1B13", "#F9E4B3", "#849689", "#46464A", "29232E",
    "#686B30", "#AB9A52", "#E8BA67", "#D68F4F", "BA512E",
    "#E54E45", "#DBC390", "#F2F2EF", "#13A3A5", "403833",
    "#65BA99", "#59A386", "#F1DDBB", "#D6C4A6", "E74C3C",
    "#A6FFBC", "#4ACFAF", "#00A995", "#006161", "003D4C",
    "#33271E", "#8B7653", "#C8D9A0", "#FDEE9D", "233331",
    "#048789", "#503D2E", "#D44D27", "#E2A72E", "EFEBC8",
    "#E5FF1E", "#A9D943", "#75A660", "#698070", "494D4B",
    "#2DEBA2", "#91F57F", "#EBAA69", "#E70049", "2B0027",
    "#990000", "#336699", "#DDDDDD", "#999999", "333333",
    "#F13A4B", "#3D3C3E", "#22BDAF", "#F4F4F4", "D7D7D7",
    "#F53A59", "#001D2D", "#15A88C", "#B7D9C8", "F3F5F4",];

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Invert_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Invert_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"invert_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D texMask;\nUNI float amount;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n\n    #ifdef USE_MASK\n        #ifdef MASK_INVERT\n            if(texture(texMask,texCoord).r>0.5)\n            {\n                outColor= col;\n                return;\n            }\n        #endif\n\n        #ifndef MASK_INVERT\n            if(texture(texMask,texCoord).r<0.5)\n            {\n                outColor= col;\n                return;\n            }\n        #endif\n    #endif\n\n\n    vec3 m=vec3( INVR , INVG , INVB );\n    vec4 invert = vec4(clamp(m-col.rgb,0.0,1.0),col.a);\n\n    outColor=cgl_blendPixel(col,invert,amount);\n\n    // outColor.rgb=m;\n}\n",};
const
    render = op.inTrigger("render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskInvert = op.inBool("Mask Invert", false),
    mask = op.inTexture("Mask"),
    invertR = op.inBool("Invert R", true),
    invertG = op.inBool("Invert G", true),
    invertB = op.inBool("Invert B", true),
    trigger = op.outTrigger("trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.invert_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask", 1);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

maskInvert.onChange =
    invertR.onChange =
    invertG.onChange =
    invertB.onChange =
    mask.onLinkChanged = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("USE_MASK", mask.isLinked());
    shader.toggleDefine("MASK_INVERT", maskInvert.get());

    shader.define("INVR", invertR.get() ? "1.0" : "0.0");
    shader.define("INVG", invertG.get() ? "1.0" : "0.0");
    shader.define("INVB", invertB.get() ? "1.0" : "0.0");
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (mask.get())cgl.setTexture(1, mask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.FXAA
// 
// **************************************************************

Ops.Gl.ImageCompose.FXAA= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"fxaa_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float FXAA_SPAN_MAX;\nUNI float FXAA_REDUCE_MUL;\nUNI float FXAA_REDUCE_MIN;\nUNI float width;\nUNI float height;\n\nvec4 getColorFXAA(vec2 coord)\n{\n    vec2 invtexsize=vec2(1.0/width,1.0/height);\n\n    float step=1.0;\n\n    vec3 rgbNW = texture(tex, coord.xy + (vec2(-step, -step)*invtexsize )).xyz;\n    vec3 rgbNE = texture(tex, coord.xy + (vec2(+step, -step)*invtexsize )).xyz;\n    vec3 rgbSW = texture(tex, coord.xy + (vec2(-step, +step)*invtexsize )).xyz;\n    vec3 rgbSE = texture(tex, coord.xy + (vec2(+step, +step)*invtexsize )).xyz;\n    vec3 rgbM  = texture(tex, coord.xy).xyz;\n\n    vec3 luma = vec3(0.299, 0.587, 0.114);\n    float lumaNW = dot(rgbNW, luma);\n    float lumaNE = dot(rgbNE, luma);\n    float lumaSW = dot(rgbSW, luma);\n    float lumaSE = dot(rgbSE, luma);\n    float lumaM  = dot( rgbM, luma);\n\n    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\n    vec2 dir;\n    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\n    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\n    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);\n\n    dir = min(vec2(FXAA_SPAN_MAX,  FXAA_SPAN_MAX),\n          max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin))*invtexsize ;\n\n    vec3 rgbA = (1.0/2.0) * (\n                texture(tex, coord.xy + dir * (1.0/3.0 - 0.5)).xyz +\n                texture(tex, coord.xy + dir * (2.0/3.0 - 0.5)).xyz);\n    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (\n                texture(tex, coord.xy + dir * (0.0/3.0 - 0.5)).xyz +\n                texture(tex, coord.xy + dir * (3.0/3.0 - 0.5)).xyz);\n    float lumaB = dot(rgbB, luma);\n\n    vec4 color=texture(tex,coord).rgba;\n\n    if((lumaB < lumaMin) || (lumaB > lumaMax)){\n      color.xyz=rgbA;\n    } else {\n      color.xyz=rgbB;\n    }\n    return color;\n}\n\nvoid main()\n{\n   vec4 col=vec4(1.0,0.0,0.0,1.0);\n   outColor= getColorFXAA(texCoord);\n}",};
// shader from: https://github.com/mattdesl/glsl-fxaa

let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");
let fxaa_span = op.inValueSelect("span", [0, 2, 4, 8, 16, 32, 64]);
let fxaa_reduceMin = op.inValueFloat("reduceMin");
let fxaa_reduceMul = op.inValueFloat("reduceMul");
let useVPSize = op.inValueBool("use viewport size", true);
let texWidth = op.inValueInt("width");
let texHeight = op.inValueInt("height");

let cgl = op.patch.cgl;
let shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.fxaa_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;
    cgl.pushShader(shader);

    if (cgl.getViewPort()[2] != texWidth.get() || cgl.getViewPort()[3] != texHeight.get())
    {
        changeRes();
    }

    cgl.currentTextureEffect.bind();
    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();

    cgl.popShader();

    trigger.trigger();
};

let uniformSpan = new CGL.Uniform(shader, "f", "FXAA_SPAN_MAX", 0);
let uniformMul = new CGL.Uniform(shader, "f", "FXAA_REDUCE_MUL", 0);
let uniformMin = new CGL.Uniform(shader, "f", "FXAA_REDUCE_MIN", 0);

fxaa_span.onChange = function ()
{
    uniformSpan.setValue(parseInt(fxaa_span.get(), 10));
};

let uWidth = new CGL.Uniform(shader, "f", "width", 0);
let uHeight = new CGL.Uniform(shader, "f", "height", 0);

function changeRes()
{
    if (useVPSize.get())
    {
        let w = cgl.getViewPort()[2];
        let h = cgl.getViewPort()[3];
        uWidth.setValue(w);
        uHeight.setValue(h);
        // texWidth.set(w);
        // texHeight.set(h);
    }
    else
    {
        uWidth.setValue(texWidth.get());
        uHeight.setValue(texHeight.get());
    }
}

texWidth.onChange = changeRes;
texHeight.onChange = changeRes;
useVPSize.onChange = changeRes;
op.onResize = changeRes;

fxaa_span.set(8);
// texWidth.set(1920);
// texHeight.set(1080);

fxaa_reduceMul.onChange = function ()
{
    uniformMul.setValue(1.0 / fxaa_reduceMul.get());
};

fxaa_reduceMin.onChange = function ()
{
    uniformMin.setValue(1.0 / fxaa_reduceMin.get());
};

fxaa_reduceMul.set(8);
fxaa_reduceMin.set(128);

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Twirl_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.Twirl_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"twirl_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\nUNI float twistAmount;\nUNI float times;\nUNI float radius;\nUNI float centerX;\nUNI float centerY;\nUNI float aspect;\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    vec2 center=vec2(centerX,centerY);\n    center =((center+1.0)/2.0);\n    vec2 tc = texCoord;\n    tc -= center;\n\n    float dist = length(vec2(tc.x,tc.y/aspect));\n    if (dist < radius)\n    {\n        float percent = (radius - dist) / radius;\n        float theta = percent * percent * twistAmount * 8.0;\n        float s = sin(theta);\n        float c = cos(theta);\n        tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));\n    }\n    tc += center;\n\n    vec4 col = texture(tex, tc);\n    vec4 base=texture(tex,texCoord);\n    outColor=cgl_blendPixel(base,col,amount);\n}\n",};
const render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    twistAmount = op.inValue("Twist amount", 500),
    radius = op.inValue("Radius", 0.5),
    centerX = op.inValue("Center X", 0),
    centerY = op.inValue("Center Y", 0),
    trigger = op.outTrigger("Next");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.twirl_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniTwistAmount = new CGL.Uniform(shader, "f", "twistAmount", 1),
    uniRadius = new CGL.Uniform(shader, "f", "radius", radius),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    unicenterX = new CGL.Uniform(shader, "f", "centerX", centerX),
    unicenterY = new CGL.Uniform(shader, "f", "centerY", centerY);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    let texture = cgl.currentTextureEffect.getCurrentSourceTexture();

    uniTwistAmount.setValue(twistAmount.get() * (1 / texture.width));
    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Devices.TouchScreen
// 
// **************************************************************

Ops.Devices.TouchScreen= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    disableScaleWeb = op.inValueBool("Disable Scaling", true),
    disableDefault = op.inValueBool("Disable Scroll", true),
    hdpi = op.inValueBool("HDPI Coordinates", false),
    active = op.inValueBool("Active", true),

    outTouched = op.outNumber("Touched", false),
    numFingers = op.outNumber("Fingers", 0),

    f1x = op.outNumber("Finger 1 X", 0),
    f1y = op.outNumber("Finger 1 Y", 0),
    f1f = op.outNumber("Finger 1 Force", 0),

    f2x = op.outNumber("Finger 2 X", 0),
    f2y = op.outNumber("Finger 2 Y", 0),
    f2f = op.outNumber("Finger 2 Force", 0),
    area = op.inSwitch("Area", ["Canvas", "Document"], "Canvas"),

    outEvents = op.outArray("Events"),
    normalize = op.inValueBool("Normalize Coordinates"),
    flipY = op.inValueBool("Flip Y"),
    outTouchStart = op.outTrigger("Touch Start"),
    outTouchEnd = op.outTrigger("Touch End");

area.onChange = updateArea;

function setPos(event)
{
    if (event.touches && event.touches.length > 0)
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[0].clientX - event.touches[0].target.offsetLeft;
        var y = event.touches[0].clientY - event.touches[0].target.offsetTop;

        if (flipY.get()) y = rect.height - y;

        if (hdpi.get())
        {
            x *= (op.patch.cgl.pixelDensity || 1);
            y *= (op.patch.cgl.pixelDensity || 1);
        }

        if (normalize.get())
        {
            x = (x / rect.width * 2.0 - 1.0);
            y = (y / rect.height * 2.0 - 1.0);
        }

        f1x.set(x);
        f1y.set(y);

        if (event.touches[0].force)f1f.set(event.touches[0].force);
    }

    if (event.touches && event.touches.length > 1)
    {
        var rect = event.target.getBoundingClientRect();
        var x = event.touches[1].clientX - event.touches[1].target.offsetLeft;
        var y = event.touches[1].clientY - event.touches[1].target.offsetTop;

        if (hdpi.get())
        {
            x *= (op.patch.cgl.pixelDensity || 1);
            y *= (op.patch.cgl.pixelDensity || 1);
        }

        if (normalize.get())
        {
            x = (x / rect.width * 2.0 - 1.0);
            y = (y / rect.height * 2.0 - 1.0);
        }

        f2x.set(x);
        f2y.set(y);

        if (event.touches[1].force)f2f.set(event.touches[1].force);
    }
    outEvents.set(event.touches);
}

const ontouchstart = function (event)
{
    outTouched.set(true);
    setPos(event);
    numFingers.set(event.touches.length);
    outTouchStart.trigger();
};

const ontouchend = function (event)
{
    outTouched.set(false);
    f1f.set(0);
    f2f.set(0);
    setPos(event);

    numFingers.set(event.touches.length);
    outTouchEnd.trigger();
};

const ontouchmove = function (event)
{
    setPos(event);
    numFingers.set(event.touches.length);
    if (disableDefault.get() || (disableScaleWeb.get() && event.scale !== 1))
    {
        event.preventDefault();
        document.body.style["touch-action"] = "none";
    }
    else
    {
        document.body.style["touch-action"] = "initial";
    }
};

const cgl = op.patch.cgl;
let listenerElement = null;
function addListeners()
{
    listenerElement.addEventListener("touchmove", ontouchmove, { "passive": false });
    listenerElement.addEventListener("touchstart", ontouchstart, { "passive": false });
    listenerElement.addEventListener("touchend", ontouchend, { "passive": false });
}

function updateArea()
{
    removeListeners();

    if (area.get() == "Document") listenerElement = document;
    else listenerElement = cgl.canvas;

    if (active.get()) addListeners();
}

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("touchmove", ontouchmove);
        listenerElement.removeEventListener("touchstart", ontouchstart);
        listenerElement.removeEventListener("touchend", ontouchend);
    }
    listenerElement = null;
}

active.onChange = function ()
{
    updateArea();
};

updateArea();

}
};






// **************************************************************
// 
// Ops.Extension.Deprecated.HSBtoRGB
// 
// **************************************************************

Ops.Extension.Deprecated.HSBtoRGB= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inH = op.inValueSlider("Hue"),
    inS = op.inValueSlider("Saturation", 1),
    inV = op.inValueSlider("Brightness", 0.5),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B");

inH.onChange = inS.onChange = inV.onChange = update;
update();

function update()
{
    let hue = (inH.get());
    let saturation = (inS.get());
    let lightness = (inV.get());

    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB

    let chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    let huePrime = hue * 6; // / 60;
    let secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime) || 0;
    let red = 0;
    let green = 0;
    let blue = 0;

    if (huePrime === 0)
    {
        red = chroma;
        green = secondComponent;
        blue = 0;
    }
    else if (huePrime === 1)
    {
        red = secondComponent;
        green = chroma;
        blue = 0;
    }
    else if (huePrime === 2)
    {
        red = 0;
        green = chroma;
        blue = secondComponent;
    }
    else if (huePrime === 3)
    {
        red = 0;
        green = secondComponent;
        blue = chroma;
    }
    else if (huePrime === 4)
    {
        red = secondComponent;
        green = 0;
        blue = chroma;
    }
    else if (huePrime >= 5)
    {
        red = chroma;
        green = 0;
        blue = secondComponent;
    }
    let lightnessAdjustment = (lightness - (chroma / 2));
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    outR.set(red);
    outG.set(green);
    outB.set(blue);

    //   return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
}

}
};






// **************************************************************
// 
// Ops.Gl.GLTF.GltfScene_v4
// 
// **************************************************************

Ops.Gl.GLTF.GltfScene_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"inc_camera_js":"const gltfCamera = class\n{\n    constructor(gltf, node)\n    {\n        this.node = node;\n        this.name = node.name;\n        // console.log(gltf);\n        this.config = gltf.json.cameras[node.camera];\n\n        this.pos = vec3.create();\n        this.quat = quat.create();\n        this.vCenter = vec3.create();\n        this.vUp = vec3.create();\n        this.vMat = mat4.create();\n    }\n\n    updateAnim(time)\n    {\n        if (this.node && this.node._animTrans)\n        {\n            vec3.set(this.pos,\n                this.node._animTrans[0].getValue(time),\n                this.node._animTrans[1].getValue(time),\n                this.node._animTrans[2].getValue(time));\n\n            quat.set(this.quat,\n                this.node._animRot[0].getValue(time),\n                this.node._animRot[1].getValue(time),\n                this.node._animRot[2].getValue(time),\n                this.node._animRot[3].getValue(time));\n        }\n    }\n\n    start(time)\n    {\n        if (cgl.tempData.shadowPass) return;\n\n        this.updateAnim(time);\n        const asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];\n\n        cgl.pushPMatrix();\n        // mat4.perspective(\n        //     cgl.pMatrix,\n        //     this.config.perspective.yfov*0.5,\n        //     asp,\n        //     this.config.perspective.znear,\n        //     this.config.perspective.zfar);\n\n        cgl.pushViewMatrix();\n        // mat4.identity(cgl.vMatrix);\n\n        // if(this.node && this.node.parent)\n        // {\n        //     console.log(this.node.parent)\n        // vec3.add(this.pos,this.pos,this.node.parent._node.translation);\n        // vec3.sub(this.vCenter,this.vCenter,this.node.parent._node.translation);\n        // mat4.translate(cgl.vMatrix,cgl.vMatrix,\n        // [\n        //     -this.node.parent._node.translation[0],\n        //     -this.node.parent._node.translation[1],\n        //     -this.node.parent._node.translation[2]\n        // ])\n        // }\n\n        // vec3.set(this.vUp, 0, 1, 0);\n        // vec3.set(this.vCenter, 0, -1, 0);\n        // // vec3.set(this.vCenter, 0, 1, 0);\n        // vec3.transformQuat(this.vCenter, this.vCenter, this.quat);\n        // vec3.normalize(this.vCenter, this.vCenter);\n        // vec3.add(this.vCenter, this.vCenter, this.pos);\n\n        // mat4.lookAt(cgl.vMatrix, this.pos, this.vCenter, this.vUp);\n\n        let mv = mat4.create();\n        mat4.invert(mv, this.node.modelMatAbs());\n\n        // console.log(this.node.modelMatAbs());\n\n        this.vMat = mv;\n\n        mat4.identity(cgl.vMatrix);\n        // console.log(mv);\n        mat4.mul(cgl.vMatrix, cgl.vMatrix, mv);\n    }\n\n    end()\n    {\n        if (cgl.tempData.shadowPass) return;\n        cgl.popPMatrix();\n        cgl.popViewMatrix();\n    }\n};\n","inc_gltf_js":"const le = true; // little endian\n\nconst Gltf = class\n{\n    constructor()\n    {\n        this.json = {};\n        this.accBuffers = [];\n        this.meshes = [];\n        this.nodes = [];\n        this.shaders = [];\n        this.timing = [];\n        this.cams = [];\n        this.startTime = performance.now();\n        this.bounds = new CABLES.CG.BoundingBox();\n        this.loaded = Date.now();\n        this.accBuffersDelete = [];\n    }\n\n    getNode(n)\n    {\n        for (let i = 0; i < this.nodes.length; i++)\n        {\n            if (this.nodes[i].name == n) return this.nodes[i];\n        }\n    }\n\n    getNodes(n)\n    {\n        const arr = [];\n        for (let i = 0; i < this.nodes.length; i++)\n        {\n            if (this.nodes[i].name == n) arr.push(this.nodes[i]);\n        }\n        return arr;\n    }\n\n    unHideAll()\n    {\n        for (let i = 0; i < this.nodes.length; i++)\n        {\n            this.nodes[i].unHide();\n        }\n    }\n};\n\nfunction Utf8ArrayToStr(array)\n{\n    if (window.TextDecoder) return new TextDecoder(\"utf-8\").decode(array);\n\n    let out, i, len, c;\n    let char2, char3;\n\n    out = \"\";\n    len = array.length;\n    i = 0;\n    while (i < len)\n    {\n        c = array[i++];\n        switch (c >> 4)\n        {\n        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:\n            // 0xxxxxxx\n            out += String.fromCharCode(c);\n            break;\n        case 12: case 13:\n            // 110x xxxx   10xx xxxx\n            char2 = array[i++];\n            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));\n            break;\n        case 14:\n            // 1110 xxxx  10xx xxxx  10xx xxxx\n            char2 = array[i++];\n            char3 = array[i++];\n            out += String.fromCharCode(((c & 0x0F) << 12) |\n                    ((char2 & 0x3F) << 6) |\n                    ((char3 & 0x3F) << 0));\n            break;\n        }\n    }\n\n    return out;\n}\n\nfunction readChunk(dv, bArr, arrayBuffer, offset)\n{\n    const chunk = {};\n\n    if (offset >= dv.byteLength)\n    {\n        // op.log(\"could not read chunk...\");\n        return;\n    }\n    chunk.size = dv.getUint32(offset + 0, le);\n\n    // chunk.type = new TextDecoder(\"utf-8\").decode(bArr.subarray(offset+4, offset+4+4));\n    chunk.type = Utf8ArrayToStr(bArr.subarray(offset + 4, offset + 4 + 4));\n\n    if (chunk.type == \"BIN\\0\")\n    {\n        // console.log(chunk.size,arrayBuffer.length,offset);\n        // try\n        // {\n        chunk.dataView = new DataView(arrayBuffer, offset + 8, chunk.size);\n        // }\n        // catch(e)\n        // {\n        //     chunk.dataView = null;\n        //     console.log(e);\n        // }\n    }\n    else\n    if (chunk.type == \"JSON\")\n    {\n        const json = Utf8ArrayToStr(bArr.subarray(offset + 8, offset + 8 + chunk.size));\n\n        try\n        {\n            const obj = JSON.parse(json);\n            chunk.data = obj;\n            outGenerator.set(obj.asset.generator);\n        }\n        catch (e)\n        {\n        }\n    }\n    else\n    {\n        op.warn(\"unknown type\", chunk.type);\n    }\n\n    return chunk;\n}\n\nfunction loadAnims(gltf)\n{\n    const uniqueAnimNames = {};\n    maxTimeDict = {};\n\n    for (let i = 0; i < gltf.json.animations.length; i++)\n    {\n        const an = gltf.json.animations[i];\n\n        an.name = an.name || \"unknown\";\n\n        for (let ia = 0; ia < an.channels.length; ia++)\n        {\n            const chan = an.channels[ia];\n\n            const node = gltf.nodes[chan.target.node];\n            const sampler = an.samplers[chan.sampler];\n\n            const acc = gltf.json.accessors[sampler.input];\n            const bufferIn = gltf.accBuffers[sampler.input];\n\n            const accOut = gltf.json.accessors[sampler.output];\n            const bufferOut = gltf.accBuffers[sampler.output];\n\n            gltf.accBuffersDelete.push(sampler.output, sampler.input);\n\n            if (bufferIn && bufferOut)\n            {\n                let numComps = 1;\n                if (accOut.type === \"VEC2\")numComps = 2;\n                else if (accOut.type === \"VEC3\")numComps = 3;\n                else if (accOut.type === \"VEC4\")numComps = 4;\n                else if (accOut.type === \"SCALAR\")\n                {\n                    numComps = bufferOut.length / bufferIn.length; // is this really the way to find out ? cant find any other way,except number of morph targets, but not really connected...\n                }\n                else op.log(\"[] UNKNOWN accOut.type\", accOut.type);\n\n                const anims = [];\n\n                uniqueAnimNames[an.name] = true;\n\n                for (let k = 0; k < numComps; k++)\n                {\n                    const newAnim = new CABLES.Anim();\n                    // newAnim.name=an.name;\n                    newAnim.batchMode = true;\n                    anims.push(newAnim);\n                }\n\n                if (sampler.interpolation === \"LINEAR\") {}\n                else if (sampler.interpolation === \"STEP\") for (let k = 0; k < numComps; k++) anims[k].defaultEasing = CABLES.EASING_ABSOLUTE;\n                else if (sampler.interpolation === \"CUBICSPLINE\") for (let k = 0; k < numComps; k++) anims[k].defaultEasing = CABLES.EASING_CUBICSPLINE;\n                else op.warn(\"unknown interpolation\", sampler.interpolation);\n\n                // console.log(bufferOut)\n\n                // if there is no keyframe for time 0 copy value of first keyframe at time 0\n                if (bufferIn[0] !== 0.0)\n                    for (let k = 0; k < numComps; k++)\n                        anims[k].setValue(0, bufferOut[0 * numComps + k]);\n\n                for (let j = 0; j < bufferIn.length; j++)\n                {\n                    // maxTime = Math.max(bufferIn[j], maxTime);\n                    maxTimeDict[an.name] = bufferIn[j];\n\n                    for (let k = 0; k < numComps; k++)\n                    {\n                        if (anims[k].defaultEasing === CABLES.EASING_CUBICSPLINE)\n                        {\n                            const idx = ((j * numComps) * 3 + k);\n\n                            const key = anims[k].setValue(bufferIn[j], bufferOut[idx + numComps]);\n                            key.bezTangIn = bufferOut[idx];\n                            key.bezTangOut = bufferOut[idx + (numComps * 2)];\n\n                            // console.log(an.name,k,bufferOut[idx+1]);\n                        }\n                        else\n                        {\n                            anims[k].setValue(bufferIn[j], bufferOut[j * numComps + k]);\n                        }\n                    }\n                }\n                for (let k = 0; k < numComps; k++)anims[k].batchMode = false;\n\n                node.setAnim(chan.target.path, an.name, anims);\n            }\n            else\n            {\n                op.warn(\"loadAmins bufferIn undefined \", bufferIn === undefined);\n                op.warn(\"loadAmins bufferOut undefined \", bufferOut === undefined);\n                op.warn(\"loadAmins \", an.name, sampler, accOut);\n                op.warn(\"loadAmins num accBuffers\", gltf.accBuffers.length);\n                op.warn(\"loadAmins num accessors\", gltf.json.accessors.length);\n            }\n        }\n    }\n\n    gltf.uniqueAnimNames = uniqueAnimNames;\n\n    outAnims.setRef(Object.keys(uniqueAnimNames));\n}\n\nfunction loadCams(gltf)\n{\n    if (!gltf || !gltf.json.cameras) return;\n\n    gltf.cameras = gltf.cameras || [];\n\n    for (let i = 0; i < gltf.nodes.length; i++)\n    {\n        if (gltf.nodes[i].hasOwnProperty(\"camera\"))\n        {\n            const cam = new gltfCamera(gltf, gltf.nodes[i]);\n            gltf.cameras.push(cam);\n        }\n    }\n}\n\nfunction loadAfterDraco()\n{\n    if (!window.DracoDecoder)\n    {\n        setTimeout(() =>\n        {\n            loadAfterDraco();\n        }, 100);\n    }\n\n    reloadSoon();\n}\n\nfunction parseGltf(arrayBuffer)\n{\n    const CHUNK_HEADER_SIZE = 8;\n\n    let j = 0, i = 0;\n\n    const gltf = new Gltf();\n    gltf.timing.push([\"Start parsing\", Math.round((performance.now() - gltf.startTime))]);\n\n    if (!arrayBuffer) return;\n    const byteArray = new Uint8Array(arrayBuffer);\n    let pos = 0;\n\n    // var string = new TextDecoder(\"utf-8\").decode(byteArray.subarray(pos, 4));\n    const string = Utf8ArrayToStr(byteArray.subarray(pos, 4));\n    pos += 4;\n    if (string != \"glTF\") return;\n\n    gltf.timing.push([\"dataview\", Math.round((performance.now() - gltf.startTime))]);\n\n    const dv = new DataView(arrayBuffer);\n    const version = dv.getUint32(pos, le);\n    pos += 4;\n    const size = dv.getUint32(pos, le);\n    pos += 4;\n\n    outVersion.set(version);\n\n    const chunks = [];\n    gltf.chunks = chunks;\n\n    chunks.push(readChunk(dv, byteArray, arrayBuffer, pos));\n    pos += chunks[0].size + CHUNK_HEADER_SIZE;\n    gltf.json = chunks[0].data;\n\n    gltf.cables = {\n        \"fileUrl\": inFile.get(),\n        \"shortFileName\": CABLES.basename(inFile.get())\n    };\n\n    outJson.setRef(gltf.json);\n    outExtensions.setRef(gltf.json.extensionsUsed || []);\n\n    let ch = readChunk(dv, byteArray, arrayBuffer, pos);\n    while (ch)\n    {\n        chunks.push(ch);\n        pos += ch.size + CHUNK_HEADER_SIZE;\n        ch = readChunk(dv, byteArray, arrayBuffer, pos);\n    }\n\n    gltf.chunks = chunks;\n\n    const views = chunks[0].data.bufferViews;\n    const accessors = chunks[0].data.accessors;\n\n    gltf.timing.push([\"Parse buffers\", Math.round((performance.now() - gltf.startTime))]);\n\n    if (gltf.json.extensionsUsed && gltf.json.extensionsUsed.indexOf(\"KHR_draco_mesh_compression\") > -1)\n    {\n        if (!window.DracoDecoder)\n        {\n            op.setUiError(\"gltfdraco\", \"GLTF draco compression lib not found / add draco op to your patch!\");\n\n            loadAfterDraco();\n            return gltf;\n        }\n        else\n        {\n            gltf.useDraco = true;\n        }\n    }\n\n    op.setUiError(\"gltfdraco\", null);\n    // let accPos = (view.byteOffset || 0) + (acc.byteOffset || 0);\n\n    if (views)\n    {\n        for (i = 0; i < accessors.length; i++)\n        {\n            const acc = accessors[i];\n            const view = views[acc.bufferView];\n\n            let numComps = 0;\n            if (acc.type == \"SCALAR\")numComps = 1;\n            else if (acc.type == \"VEC2\")numComps = 2;\n            else if (acc.type == \"VEC3\")numComps = 3;\n            else if (acc.type == \"VEC4\")numComps = 4;\n            else if (acc.type == \"MAT4\")numComps = 16;\n            else console.error(\"unknown accessor type\", acc.type);\n\n            //   const decoder = new decoderModule.Decoder();\n            //   const decodedGeometry = decodeDracoData(data, decoder);\n            //   // Encode mesh\n            //   encodeMeshToFile(decodedGeometry, decoder);\n\n            //   decoderModule.destroy(decoder);\n            //   decoderModule.destroy(decodedGeometry);\n\n            // 5120 (BYTE)\t1\n            // 5121 (UNSIGNED_BYTE)\t1\n            // 5122 (SHORT)\t2\n\n            if (chunks[1].dataView)\n            {\n                if (view)\n                {\n                    const num = acc.count * numComps;\n                    let accPos = (view.byteOffset || 0) + (acc.byteOffset || 0);\n                    let stride = view.byteStride || 0;\n                    let dataBuff = null;\n\n                    if (acc.componentType == 5126 || acc.componentType == 5125) // 4byte FLOAT or INT\n                    {\n                        stride = stride || 4;\n\n                        const isInt = acc.componentType == 5125;\n                        if (isInt)dataBuff = new Uint32Array(num);\n                        else dataBuff = new Float32Array(num);\n\n                        dataBuff.cblStride = numComps;\n\n                        for (j = 0; j < num; j++)\n                        {\n                            if (isInt) dataBuff[j] = chunks[1].dataView.getUint32(accPos, le);\n                            else dataBuff[j] = chunks[1].dataView.getFloat32(accPos, le);\n\n                            if (stride != 4 && (j + 1) % numComps === 0)accPos += stride - (numComps * 4);\n                            accPos += 4;\n                        }\n                    }\n                    else if (acc.componentType == 5123) // UNSIGNED_SHORT\n                    {\n                        stride = stride || 2;\n\n                        dataBuff = new Uint16Array(num);\n                        dataBuff.cblStride = stride;\n\n                        for (j = 0; j < num; j++)\n                        {\n                            dataBuff[j] = chunks[1].dataView.getUint16(accPos, le);\n\n                            if (stride != 2 && (j + 1) % numComps === 0) accPos += stride - (numComps * 2);\n\n                            accPos += 2;\n                        }\n                    }\n                    else if (acc.componentType == 5121 || acc.componentType == 5120) // UNSIGNED_BYTE\n                    {\n                        stride = stride || 1;\n\n                        if (acc.componentType == 5121) dataBuff = new Uint8Array(num);\n                        else dataBuff = new Int8Array(num);\n\n                        dataBuff.cblStride = stride;\n\n                        for (j = 0; j < num; j++)\n                        {\n                            if (acc.componentType == 5121)\n                                dataBuff[j] = chunks[1].dataView.getUint8(accPos, le);\n                            else\n                                dataBuff[j] = chunks[1].dataView.getInt8(accPos, le);\n\n                            if (stride != 1 && (j + 1) % numComps === 0) accPos += stride - (numComps * 1);\n\n                            accPos += 1;\n                        }\n                    }\n                    else if (acc.componentType == 5120) // SIGNED_BYTE\n                    {\n                        stride = stride || 1;\n\n                        dataBuff = new Int8Array(num);\n                        dataBuff.cblStride = stride;\n\n                        for (j = 0; j < num; j++)\n                        {\n                            dataBuff[j] = chunks[1].dataView.getUint8(accPos, le);\n\n                            if (stride != 1 && (j + 1) % numComps === 0) accPos += stride - (numComps * 1);\n\n                            accPos += 1;\n                        }\n                    }\n                    else\n                    {\n                        console.error(\"unknown component type\", acc.componentType);\n                    }\n\n                    gltf.accBuffers.push(dataBuff);\n                }\n                else\n                {\n                    // console.log(\"has no dataview\");\n                }\n            }\n        }\n    }\n\n    gltf.timing.push([\"Parse mesh groups\", Math.round((performance.now() - gltf.startTime))]);\n\n    gltf.json.meshes = gltf.json.meshes || [];\n\n    if (gltf.json.meshes)\n    {\n        for (i = 0; i < gltf.json.meshes.length; i++)\n        {\n            const mesh = new gltfMeshGroup(gltf, gltf.json.meshes[i], i);\n            gltf.meshes.push(mesh);\n        }\n    }\n\n    gltf.timing.push([\"Parse nodes\", Math.round((performance.now() - gltf.startTime))]);\n\n    for (i = 0; i < gltf.json.nodes.length; i++)\n    {\n        if (gltf.json.nodes[i].children)\n            for (j = 0; j < gltf.json.nodes[i].children.length; j++)\n            {\n                gltf.json.nodes[gltf.json.nodes[i].children[j]].isChild = true;\n            }\n    }\n\n    for (i = 0; i < gltf.json.nodes.length; i++)\n    {\n        const node = new gltfNode(gltf.json.nodes[i], gltf);\n        gltf.nodes.push(node);\n    }\n\n    for (i = 0; i < gltf.nodes.length; i++)\n    {\n        const node = gltf.nodes[i];\n\n        if (!node.children) continue;\n        for (let j = 0; j < node.children.length; j++)\n        {\n            gltf.nodes[node.children[j]].parent = node;\n        }\n    }\n\n    for (i = 0; i < gltf.nodes.length; i++)\n    {\n        gltf.nodes[i].initSkin();\n    }\n\n    needsMatUpdate = true;\n\n    gltf.timing.push([\"load anims\", Math.round((performance.now() - gltf.startTime))]);\n\n    if (gltf.json.animations) loadAnims(gltf);\n\n    gltf.timing.push([\"load cameras\", Math.round((performance.now() - gltf.startTime))]);\n\n    if (gltf.json.cameras) loadCams(gltf);\n\n    gltf.timing.push([\"finished\", Math.round((performance.now() - gltf.startTime))]);\n    return gltf;\n}\n","inc_mesh_js":"let gltfMesh = class\n{\n    constructor(name, prim, gltf, finished)\n    {\n        this.POINTS = 0;\n        this.LINES = 1;\n        this.LINE_LOOP = 2;\n        this.LINE_STRIP = 3;\n        this.TRIANGLES = 4;\n        this.TRIANGLE_STRIP = 5;\n        this.TRIANGLE_FAN = 6;\n\n        this.test = 0;\n        this.name = name;\n        this.submeshIndex = 0;\n        this.material = prim.material;\n        this.mesh = null;\n        this.geom = new CGL.Geometry(\"gltf_\" + this.name);\n        this.geom.verticesIndices = [];\n        this.bounds = null;\n        this.primitive = 4;\n        this.morphTargetsRenderMod = null;\n        this.weights = prim.weights;\n\n        if (prim.hasOwnProperty(\"mode\")) this.primitive = prim.mode;\n\n        if (prim.hasOwnProperty(\"indices\")) this.geom.verticesIndices = gltf.accBuffers[prim.indices];\n\n        gltf.loadingMeshes = gltf.loadingMeshes || 0;\n        gltf.loadingMeshes++;\n\n        this.materialJson =\n            this._matPbrMetalness =\n            this._matPbrRoughness =\n            this._matDiffuseColor = null;\n\n        if (gltf.json.materials)\n        {\n            if (this.material != -1) this.materialJson = gltf.json.materials[this.material];\n\n            if (this.materialJson && this.materialJson.pbrMetallicRoughness)\n            {\n                if (!this.materialJson.pbrMetallicRoughness.hasOwnProperty(\"baseColorFactor\")) this._matDiffuseColor = [1, 1, 1, 1];\n                else this._matDiffuseColor = this.materialJson.pbrMetallicRoughness.baseColorFactor;\n\n                this._matDiffuseColor = this.materialJson.pbrMetallicRoughness.baseColorFactor;\n\n                if (!this.materialJson.pbrMetallicRoughness.hasOwnProperty(\"metallicFactor\")) this._matPbrMetalness = 1.0;\n                else this._matPbrMetalness = this.materialJson.pbrMetallicRoughness.metallicFactor || null;\n\n                if (!this.materialJson.pbrMetallicRoughness.hasOwnProperty(\"roughnessFactor\")) this._matPbrRoughness = 1.0;\n                else this._matPbrRoughness = this.materialJson.pbrMetallicRoughness.roughnessFactor || null;\n            }\n        }\n\n        if (gltf.useDraco && prim.extensions.KHR_draco_mesh_compression)\n        {\n            const view = gltf.chunks[0].data.bufferViews[prim.extensions.KHR_draco_mesh_compression.bufferView];\n            const num = view.byteLength;\n            const dataBuff = new Int8Array(num);\n            let accPos = (view.byteOffset || 0);// + (acc.byteOffset || 0);\n            for (let j = 0; j < num; j++)\n            {\n                dataBuff[j] = gltf.chunks[1].dataView.getInt8(accPos, le);\n                accPos++;\n            }\n\n            const dracoDecoder = window.DracoDecoder;\n            dracoDecoder.decodeGeometry(dataBuff.buffer, (geometry) =>\n            {\n                const geom = new CGL.Geometry(\"draco mesh \" + name);\n\n                for (let i = 0; i < geometry.attributes.length; i++)\n                {\n                    const attr = geometry.attributes[i];\n\n                    if (attr.name === \"position\") geom.vertices = attr.array;\n                    else if (attr.name === \"normal\") geom.vertexNormals = attr.array;\n                    else if (attr.name === \"uv\") geom.texCoords = attr.array;\n                    else if (attr.name === \"color\") geom.vertexColors = this.calcVertexColors(attr.array);\n                    else if (attr.name === \"joints\") geom.setAttribute(\"attrJoints\", Array.from(attr.array), 4);\n                    else if (attr.name === \"weights\")\n                    {\n                        const arr4 = new Float32Array(attr.array.length / attr.itemSize * 4);\n\n                        for (let k = 0; k < attr.array.length / attr.itemSize; k++)\n                        {\n                            arr4[k * 4] = arr4[k * 4 + 1] = arr4[k * 4 + 2] = arr4[k * 4 + 3] = 0;\n                            for (let j = 0; j < attr.itemSize; j++)\n                                arr4[k * 4 + j] = attr.array[k * attr.itemSize + j];\n                        }\n                        geom.setAttribute(\"attrWeights\", arr4, 4);\n                    }\n                    else op.logWarn(\"unknown draco attrib\", attr);\n                }\n\n                geometry.attributes = null;\n                geom.verticesIndices = geometry.index.array;\n\n                this.setGeom(geom);\n\n                this.mesh = null;\n                gltf.loadingMeshes--;\n                gltf.timing.push([\"draco decode\", Math.round((performance.now() - gltf.startTime))]);\n\n                if (finished)finished(this);\n            }, (error) => { op.logError(error); });\n        }\n        else\n        {\n            gltf.loadingMeshes--;\n            this.fillGeomAttribs(gltf, this.geom, prim.attributes);\n\n            if (prim.targets)\n            {\n                for (let j = 0; j < prim.targets.length; j++)\n                {\n                    const tgeom = new CGL.Geometry(\"gltf_target_\" + j);\n\n                    // if (prim.hasOwnProperty(\"indices\")) tgeom.verticesIndices = gltf.accBuffers[prim.indices];\n\n                    this.fillGeomAttribs(gltf, tgeom, prim.targets[j], false);\n\n                    // { // calculate normals for final position of morphtarget for later...\n                    //     for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] += this.geom.vertices[i];\n                    //     tgeom.calculateNormals();\n                    //     for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] -= this.geom.vertices[i];\n                    // }\n\n                    this.geom.morphTargets.push(tgeom);\n                }\n            }\n            if (finished)finished(this);\n        }\n    }\n\n    _linearToSrgb(x)\n    {\n        if (x <= 0)\n            return 0;\n        else if (x >= 1)\n            return 1;\n        else if (x < 0.0031308)\n            return x * 12.92;\n        else\n            return x ** (1 / 2.2) * 1.055 - 0.055;\n    }\n\n    calcVertexColors(arr, type)\n    {\n        let vertexColors = null;\n        if (arr instanceof Float32Array)\n        {\n            let div = false;\n            for (let i = 0; i < arr.length; i++)\n            {\n                if (arr[i] > 1)\n                {\n                    div = true;\n                    continue;\n                }\n            }\n\n            if (div)\n                for (let i = 0; i < arr.length; i++) arr[i] /= 65535;\n\n            vertexColors = arr;\n        }\n\n        else if (arr instanceof Uint16Array)\n        {\n            const fb = new Float32Array(arr.length);\n            for (let i = 0; i < arr.length; i++) fb[i] = arr[i] / 65535;\n\n            vertexColors = fb;\n        }\n        else vertexColors = arr;\n\n        for (let i = 0; i < vertexColors.length; i++)\n        {\n            vertexColors[i] = this._linearToSrgb(vertexColors[i]);\n        }\n\n        if (arr.cblStride == 3)\n        {\n            const nc = new Float32Array(vertexColors.length / 3 * 4);\n            for (let i = 0; i < vertexColors.length / 3; i++)\n            {\n                nc[i * 4 + 0] = vertexColors[i * 3 + 0];\n                nc[i * 4 + 1] = vertexColors[i * 3 + 1];\n                nc[i * 4 + 2] = vertexColors[i * 3 + 2];\n                nc[i * 4 + 3] = 1;\n            }\n            vertexColors = nc;\n        }\n\n        return vertexColors;\n    }\n\n    fillGeomAttribs(gltf, tgeom, attribs, setGeom)\n    {\n        if (attribs.hasOwnProperty(\"POSITION\")) tgeom.vertices = gltf.accBuffers[attribs.POSITION];\n        if (attribs.hasOwnProperty(\"NORMAL\")) tgeom.vertexNormals = gltf.accBuffers[attribs.NORMAL];\n        if (attribs.hasOwnProperty(\"TANGENT\")) tgeom.tangents = gltf.accBuffers[attribs.TANGENT];\n\n        // // console.log(gltf.accBuffers[attribs.COLOR_0])\n        // console.log(gltf);\n\n        if (attribs.hasOwnProperty(\"COLOR_0\")) tgeom.vertexColors = this.calcVertexColors(gltf.accBuffers[attribs.COLOR_0], gltf.accBuffers[attribs.COLOR_0].type || 4);\n        if (attribs.hasOwnProperty(\"COLOR_1\")) tgeom.setAttribute(\"attrVertColor1\", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_1]), gltf.accBuffers[attribs.COLOR_1].type || 4);\n        if (attribs.hasOwnProperty(\"COLOR_2\")) tgeom.setAttribute(\"attrVertColor2\", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_2]), gltf.accBuffers[attribs.COLOR_2].type || 4);\n        if (attribs.hasOwnProperty(\"COLOR_3\")) tgeom.setAttribute(\"attrVertColor3\", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_3]), gltf.accBuffers[attribs.COLOR_3].type || 4);\n        if (attribs.hasOwnProperty(\"COLOR_4\")) tgeom.setAttribute(\"attrVertColor4\", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_4]), gltf.accBuffers[attribs.COLOR_4].type || 4);\n\n        if (attribs.hasOwnProperty(\"TEXCOORD_0\")) tgeom.texCoords = gltf.accBuffers[attribs.TEXCOORD_0];\n        if (attribs.hasOwnProperty(\"TEXCOORD_1\")) tgeom.setAttribute(\"attrTexCoord1\", gltf.accBuffers[attribs.TEXCOORD_1], 2);\n        if (attribs.hasOwnProperty(\"TEXCOORD_2\")) tgeom.setAttribute(\"attrTexCoord2\", gltf.accBuffers[attribs.TEXCOORD_2], 2);\n        if (attribs.hasOwnProperty(\"TEXCOORD_3\")) tgeom.setAttribute(\"attrTexCoord3\", gltf.accBuffers[attribs.TEXCOORD_3], 2);\n        if (attribs.hasOwnProperty(\"TEXCOORD_4\")) tgeom.setAttribute(\"attrTexCoord4\", gltf.accBuffers[attribs.TEXCOORD_4], 2);\n\n        if (attribs.hasOwnProperty(\"WEIGHTS_0\"))\n        {\n            tgeom.setAttribute(\"attrWeights\", gltf.accBuffers[attribs.WEIGHTS_0], 4);\n        }\n        if (attribs.hasOwnProperty(\"JOINTS_0\"))\n        {\n            if (!gltf.accBuffers[attribs.JOINTS_0])console.log(\"no !gltf.accBuffers[attribs.JOINTS_0]\");\n            tgeom.setAttribute(\"attrJoints\", gltf.accBuffers[attribs.JOINTS_0], 4);\n        }\n\n        if (attribs.hasOwnProperty(\"POSITION\")) gltf.accBuffersDelete.push(attribs.POSITION);\n        if (attribs.hasOwnProperty(\"NORMAL\")) gltf.accBuffersDelete.push(attribs.NORMAL);\n        if (attribs.hasOwnProperty(\"TEXCOORD_0\")) gltf.accBuffersDelete.push(attribs.TEXCOORD_0);\n        if (attribs.hasOwnProperty(\"TANGENT\")) gltf.accBuffersDelete.push(attribs.TANGENT);\n        if (attribs.hasOwnProperty(\"COLOR_0\"))gltf.accBuffersDelete.push(attribs.COLOR_0);\n        if (attribs.hasOwnProperty(\"COLOR_0\"))gltf.accBuffersDelete.push(attribs.COLOR_0);\n        if (attribs.hasOwnProperty(\"COLOR_1\"))gltf.accBuffersDelete.push(attribs.COLOR_1);\n        if (attribs.hasOwnProperty(\"COLOR_2\"))gltf.accBuffersDelete.push(attribs.COLOR_2);\n        if (attribs.hasOwnProperty(\"COLOR_3\"))gltf.accBuffersDelete.push(attribs.COLOR_3);\n\n        if (attribs.hasOwnProperty(\"TEXCOORD_1\")) gltf.accBuffersDelete.push(attribs.TEXCOORD_1);\n        if (attribs.hasOwnProperty(\"TEXCOORD_2\")) gltf.accBuffersDelete.push(attribs.TEXCOORD_2);\n        if (attribs.hasOwnProperty(\"TEXCOORD_3\")) gltf.accBuffersDelete.push(attribs.TEXCOORD_3);\n        if (attribs.hasOwnProperty(\"TEXCOORD_4\")) gltf.accBuffersDelete.push(attribs.TEXCOORD_4);\n\n        if (setGeom !== false) if (tgeom && tgeom.verticesIndices) this.setGeom(tgeom);\n    }\n\n    setGeom(geom)\n    {\n        geom.vertexNormals = geom.vertexNormals || [];\n\n        if (inNormFormat.get() == \"X-ZY\")\n        {\n            for (let i = 0; i < geom.vertexNormals.length; i += 3)\n            {\n                let t = geom.vertexNormals[i + 2];\n                geom.vertexNormals[i + 2] = geom.vertexNormals[i + 1];\n                geom.vertexNormals[i + 1] = -t;\n            }\n        }\n\n        if (inVertFormat.get() == \"XZ-Y\")\n        {\n            for (let i = 0; i < geom.vertices.length; i += 3)\n            {\n                let t = geom.vertices[i + 2];\n                geom.vertices[i + 2] = -geom.vertices[i + 1];\n                geom.vertices[i + 1] = t;\n            }\n        }\n        try\n        {\n            if (this.primitive == this.TRIANGLES)\n            {\n                if (inCalcNormals.get() == \"Force Smooth\" || inCalcNormals.get() == false) geom.calculateNormals();\n                else if (!geom.vertexNormals.length && inCalcNormals.get() == \"Auto\") geom.calculateNormals({ \"smooth\": false });\n\n                if ((!geom.biTangents || geom.biTangents.length == 0) && geom.tangents)\n                {\n                    const bitan = vec3.create();\n                    const tan = vec3.create();\n\n                    const tangents = geom.tangents;\n                    geom.tangents = new Float32Array(tangents.length / 4 * 3);\n                    geom.biTangents = new Float32Array(tangents.length / 4 * 3);\n\n                    for (let i = 0; i < tangents.length; i += 4)\n                    {\n                        const idx = i / 4 * 3;\n\n                        vec3.cross(\n                            bitan,\n                            [geom.vertexNormals[idx], geom.vertexNormals[idx + 1], geom.vertexNormals[idx + 2]],\n                            [tangents[i], tangents[i + 1], tangents[i + 2]]\n                        );\n\n                        vec3.div(bitan, bitan, [tangents[i + 3], tangents[i + 3], tangents[i + 3]]);\n                        vec3.normalize(bitan, bitan);\n\n                        geom.biTangents[idx + 0] = bitan[0];\n                        geom.biTangents[idx + 1] = bitan[1];\n                        geom.biTangents[idx + 2] = bitan[2];\n\n                        geom.tangents[idx + 0] = tangents[i + 0];\n                        geom.tangents[idx + 1] = tangents[i + 1];\n                        geom.tangents[idx + 2] = tangents[i + 2];\n                    }\n                }\n\n                if (geom.tangents.length === 0 || inCalcNormals.get() != \"Never\")\n                {\n                // console.log(\"[gltf ]no tangents... calculating tangents...\");\n                    geom.calcTangentsBitangents();\n                }\n            }\n            else\n            {\n                console.warn(\"GLFT unknown primitive\", this.primitive);\n            }\n        }\n        catch (e)\n        {\n            console.error(\"e\", e);\n        }\n\n        this.geom = geom;\n\n        this.bounds = geom.getBounds();\n    }\n\n    bindMaterial()\n    {\n\n    }\n\n    render(cgl, ignoreMaterial, skinRenderer)\n    {\n        if (!this.mesh && this.geom && this.geom.verticesIndices)\n        {\n            let g = this.geom;\n            if (this.geom.vertices.length / 3 > 64000 && this.geom.verticesIndices.length > 0)\n            {\n                g = this.geom.copy();\n                g.unIndex(false, true);\n            }\n\n            let glprim;\n\n            if (cgl.gl)\n            {\n                if (this.primitive == this.TRIANGLES)glprim = cgl.gl.TRIANGLES;\n                else if (this.primitive == this.LINES)glprim = cgl.gl.LINES;\n                else if (this.primitive == this.LINE_STRIP)glprim = cgl.gl.LINE_STRIP;\n                else if (this.primitive == this.POINTS)glprim = cgl.gl.POINTS;\n                else\n                {\n                    op.logWarn(\"unknown primitive type\", this);\n                }\n            }\n\n            this.mesh = op.patch.cg.createMesh(g, { \"glPrimitive\": glprim });\n        }\n\n        if (this.mesh)\n        {\n            // update morphTargets\n            if (this.geom && this.geom.morphTargets.length && !this.morphTargetsRenderMod)\n            {\n                this.mesh.addVertexNumbers = true;\n                this.morphTargetsRenderMod = new GltfTargetsRenderer(this);\n            }\n\n            let useMat = !ignoreMaterial && this.material != -1 && gltf.shaders[this.material];\n            if (skinRenderer)useMat = false;\n\n            if (useMat) cgl.pushShader(gltf.shaders[this.material]);\n\n            const currentShader = cgl.getShader() || {};\n            const uniDiff = currentShader.uniformColorDiffuse;\n\n            const uniPbrMetalness = currentShader.uniformPbrMetalness;\n            const uniPbrRoughness = currentShader.uniformPbrRoughness;\n\n            // if (gltf.shaders[this.material] && !inUseMatProps.get())\n            // {\n            //     gltf.shaders[this.material]=null;\n            // }\n\n            if (!gltf.shaders[this.material] && inUseMatProps.get())\n            {\n                if (uniDiff && this._matDiffuseColor)\n                {\n                    this._matDiffuseColorOrig = [uniDiff.getValue()[0], uniDiff.getValue()[1], uniDiff.getValue()[2], uniDiff.getValue()[3]];\n                    uniDiff.setValue(this._matDiffuseColor);\n                }\n\n                if (uniPbrMetalness)\n                    if (this._matPbrMetalness != null)\n                    {\n                        this._matPbrMetalnessOrig = uniPbrMetalness.getValue();\n                        uniPbrMetalness.setValue(this._matPbrMetalness);\n                    }\n                    else\n                        uniPbrMetalness.setValue(0);\n\n                if (uniPbrRoughness)\n                    if (this._matPbrRoughness != null)\n                    {\n                        this._matPbrRoughnessOrig = uniPbrRoughness.getValue();\n                        uniPbrRoughness.setValue(this._matPbrRoughness);\n                    }\n                    else\n                    {\n                        uniPbrRoughness.setValue(0);\n                    }\n            }\n\n            if (this.morphTargetsRenderMod) this.morphTargetsRenderMod.renderStart(cgl, 0);\n            if (this.mesh)\n            {\n                this.mesh.render(cgl.getShader(), ignoreMaterial);\n            }\n            if (this.morphTargetsRenderMod) this.morphTargetsRenderMod.renderFinish(cgl);\n\n            if (inUseMatProps.get())\n            {\n                this.setMatProps(cgl);\n            }\n\n            if (useMat) cgl.popShader();\n        }\n        else\n        {\n            console.log(\"no mesh......\");\n        }\n    }\n\n    setMatProps(cgl)\n    {\n        const currentShader = cgl.getShader() || {};\n        const uniDiff = currentShader.uniformColorDiffuse;\n\n        const uniPbrMetalness = currentShader.uniformPbrMetalness;\n        const uniPbrRoughness = currentShader.uniformPbrRoughness;\n\n        if (uniDiff && this._matDiffuseColor) uniDiff.setValue(this._matDiffuseColorOrig);\n        if (uniPbrMetalness && this._matPbrMetalnessOrig != undefined) uniPbrMetalness.setValue(this._matPbrMetalnessOrig);\n        if (uniPbrRoughness && this._matPbrRoughnessOrig != undefined) uniPbrRoughness.setValue(this._matPbrRoughnessOrig);\n    }\n};\n","inc_meshGroup_js":"const gltfMeshGroup = class\n{\n    constructor(gltf, m, index)\n    {\n        this.bounds = new CABLES.CG.BoundingBox();\n        this.meshes = [];\n\n        m.name = m.name || (\"unnamed mesh \" + unknownCount++);\n\n        this.name = m.name;\n        const prims = m.primitives;\n\n        for (let i = 0; i < prims.length; i++)\n        {\n            const mesh = new gltfMesh(this.name, prims[i], gltf, (mesh) =>\n            {\n                mesh.extras = m.extras;\n                this.bounds.applyBoundingBox(mesh.bounds);\n            });\n\n            mesh.submeshIndex = i;\n            this.meshes.push(mesh);\n        }\n    }\n\n    render(cgl, ignoreMat, skinRenderer, _time, weights)\n    {\n        for (let i = 0; i < this.meshes.length; i++)\n        {\n            const useMat = gltf.shaders[this.meshes[i].material];\n\n            if (!ignoreMat && useMat) cgl.pushShader(gltf.shaders[this.meshes[i].material]);\n            if (skinRenderer)skinRenderer.renderStart(cgl, _time);\n            if (weights) this.meshes[i].weights = weights;\n            this.meshes[i].render(cgl, ignoreMat, skinRenderer, _time);\n            if (skinRenderer)skinRenderer.renderFinish(cgl);\n            if (!ignoreMat && useMat) cgl.popShader();\n        }\n    }\n};\n","inc_node_js":"const gltfNode = class\n{\n    constructor(node, gltf)\n    {\n        this.isChild = node.isChild || false;\n        this.name = node.name;\n\n        if (!node.name)\n            if (node.hasOwnProperty(\"mesh\"))\n            {\n                this.name = \"unnamed\";\n            }\n            else\n            {\n                this.name = \"unnamed node \" + CABLES.simpleId();\n            }\n\n        if (node.hasOwnProperty(\"camera\")) this.camera = node.camera;\n        this.hidden = false;\n        this.mat = mat4.create();\n        this._animActions = {};\n        this.animWeights = [];\n        this._animMat = mat4.create();\n        this._tempMat = mat4.create();\n        this._tempQuat = quat.create();\n        this._tempRotmat = mat4.create();\n        this.mesh = null;\n        this.children = [];\n        this._node = node;\n        this._gltf = gltf;\n        this.absMat = mat4.create();\n        this.addTranslate = null;\n        this._tempAnimScale = null;\n        this.addMulMat = null;\n        this.updateMatrix();\n        this.skinRenderer = null;\n        this.copies = [];\n    }\n\n    get skin()\n    {\n        if (this._node.hasOwnProperty(\"skin\")) return this._node.skin;\n        else return -1;\n    }\n\n    copy()\n    {\n        this.isCopy = true;\n        const n = new gltfNode(this._node, this._gltf);\n        n.copyOf = this;\n\n        n._animActions = this._animActions;\n        n.children = this.children;\n        if (this.skin) n.skinRenderer = new GltfSkin(this);\n\n        this.updateMatrix();\n        return n;\n    }\n\n    hasSkin()\n    {\n        if (this._node.hasOwnProperty(\"skin\")) return this._gltf.json.skins[this._node.skin].name || \"unknown\";\n        return false;\n    }\n\n    initSkin()\n    {\n        if (this.skin > -1)\n        {\n            this.skinRenderer = new GltfSkin(this);\n        }\n    }\n\n    updateMatrix()\n    {\n        mat4.identity(this.mat);\n        if (this._node.translation) mat4.translate(this.mat, this.mat, this._node.translation);\n\n        if (this._node.rotation)\n        {\n            const rotmat = mat4.create();\n            this._rot = this._node.rotation;\n\n            mat4.fromQuat(rotmat, this._node.rotation);\n            mat4.mul(this.mat, this.mat, rotmat);\n        }\n\n        if (this._node.scale)\n        {\n            this._scale = this._node.scale;\n            mat4.scale(this.mat, this.mat, this._scale);\n        }\n\n        if (this._node.hasOwnProperty(\"mesh\"))\n        {\n            this.mesh = this._gltf.meshes[this._node.mesh];\n        }\n\n        if (this._node.children)\n        {\n            for (let i = 0; i < this._node.children.length; i++)\n            {\n                this._gltf.json.nodes[i].isChild = true;\n                if (this._gltf.nodes[this._node.children[i]]) this._gltf.nodes[this._node.children[i]].isChild = true;\n                this.children.push(this._node.children[i]);\n            }\n        }\n    }\n\n    unHide()\n    {\n        this.hidden = false;\n        for (let i = 0; i < this.children.length; i++)\n            if (this.children[i].unHide) this.children[i].unHide();\n    }\n\n    calcBounds(gltf, mat, bounds)\n    {\n        const localMat = mat4.create();\n\n        if (mat) mat4.copy(localMat, mat);\n        if (this.mat) mat4.mul(localMat, localMat, this.mat);\n\n        if (this.mesh)\n        {\n            const bb = this.mesh.bounds.copy();\n            bb.mulMat4(localMat);\n            bounds.applyBoundingBox(bb);\n\n            if (bounds.changed)\n            {\n                boundingPoints.push(\n                    bb._min[0] || 0, bb._min[1] || 0, bb._min[2] || 0, bb._max[0] || 0, bb._max[1] || 0, bb._max[2] || 0);\n            }\n        }\n\n        for (let i = 0; i < this.children.length; i++)\n        {\n            if (gltf.nodes[this.children[i]] && gltf.nodes[this.children[i]].calcBounds)\n            {\n                const b = gltf.nodes[this.children[i]].calcBounds(gltf, localMat, bounds);\n\n                bounds.applyBoundingBox(b);\n            }\n        }\n\n        if (bounds.changed) return bounds;\n        else return null;\n    }\n\n    setAnimAction(name)\n    {\n        if (!name) return;\n\n        this._currentAnimaction = name;\n\n        if (name && !this._animActions[name]) return null;\n\n        for (let path in this._animActions[name])\n        {\n            if (path == \"translation\") this._animTrans = this._animActions[name][path];\n            else if (path == \"rotation\") this._animRot = this._animActions[name][path];\n            else if (path == \"scale\") this._animScale = this._animActions[name][path];\n            else if (path == \"weights\") this.animWeights = this._animActions[name][path];\n        }\n    }\n\n    setAnim(path, name, anims)\n    {\n        if (!path || !name || !anims) return;\n\n        this._animActions[name] = this._animActions[name] || {};\n\n        // debugger;\n\n        // for (let i = 0; i < this.copies.length; i++) this.copies[i]._animActions = this._animActions;\n\n        if (this._animActions[name][path]) op.log(\"[gltfNode] animation action path already exists\", name, path, this._animActions[name][path]);\n\n        this._animActions[name][path] = anims;\n\n        if (path == \"translation\") this._animTrans = anims;\n        else if (path == \"rotation\") this._animRot = anims;\n        else if (path == \"scale\") this._animScale = anims;\n        else if (path == \"weights\") this.animWeights = this._animActions[name][path];\n    }\n\n    modelMatLocal()\n    {\n        return this._animMat || this.mat;\n    }\n\n    modelMatAbs()\n    {\n        return this.absMat;\n    }\n\n    transform(cgl, _time)\n    {\n        if (!_time && _time != 0)_time = time;\n\n        this._lastTimeTrans = _time;\n\n        gltfTransforms++;\n\n        if (!this._animTrans && !this._animRot && !this._animScale)\n        {\n            mat4.mul(cgl.mMatrix, cgl.mMatrix, this.mat);\n            this._animMat = null;\n        }\n        else\n        {\n            this._animMat = this._animMat || mat4.create();\n            mat4.identity(this._animMat);\n\n            const playAnims = true;\n\n            if (playAnims && this._animTrans)\n            {\n                mat4.translate(this._animMat, this._animMat, [\n                    this._animTrans[0].getValue(_time),\n                    this._animTrans[1].getValue(_time),\n                    this._animTrans[2].getValue(_time)]);\n            }\n            else\n            if (this._node.translation) mat4.translate(this._animMat, this._animMat, this._node.translation);\n\n            if (playAnims && this._animRot)\n            {\n                if (this._animRot[0].defaultEasing == CABLES.EASING_LINEAR) CABLES.Anim.slerpQuaternion(_time, this._tempQuat, this._animRot[0], this._animRot[1], this._animRot[2], this._animRot[3]);\n                else if (this._animRot[0].defaultEasing == CABLES.EASING_ABSOLUTE)\n                {\n                    this._tempQuat[0] = this._animRot[0].getValue(_time);\n                    this._tempQuat[1] = this._animRot[1].getValue(_time);\n                    this._tempQuat[2] = this._animRot[2].getValue(_time);\n                    this._tempQuat[3] = this._animRot[3].getValue(_time);\n                }\n                else if (this._animRot[0].defaultEasing == CABLES.EASING_CUBICSPLINE)\n                {\n                    CABLES.Anim.slerpQuaternion(_time, this._tempQuat, this._animRot[0], this._animRot[1], this._animRot[2], this._animRot[3]);\n                }\n\n                mat4.fromQuat(this._tempMat, this._tempQuat);\n                mat4.mul(this._animMat, this._animMat, this._tempMat);\n            }\n            else if (this._rot)\n            {\n                mat4.fromQuat(this._tempRotmat, this._rot);\n                mat4.mul(this._animMat, this._animMat, this._tempRotmat);\n            }\n\n            if (playAnims && this._animScale)\n            {\n                if (!this._tempAnimScale) this._tempAnimScale = [1, 1, 1];\n                this._tempAnimScale[0] = this._animScale[0].getValue(_time);\n                this._tempAnimScale[1] = this._animScale[1].getValue(_time);\n                this._tempAnimScale[2] = this._animScale[2].getValue(_time);\n                mat4.scale(this._animMat, this._animMat, this._tempAnimScale);\n            }\n            else if (this._scale) mat4.scale(this._animMat, this._animMat, this._scale);\n\n            mat4.mul(cgl.mMatrix, cgl.mMatrix, this._animMat);\n        }\n\n        if (this.animWeights)\n        {\n            this.weights = this.weights || [];\n\n            let str = \"\";\n            for (let i = 0; i < this.animWeights.length; i++)\n            {\n                this.weights[i] = this.animWeights[i].getValue(_time);\n                str += this.weights[i] + \"/\";\n            }\n\n            // this.mesh.weights=this.animWeights.get(_time);\n        }\n\n        if (this.addTranslate) mat4.translate(cgl.mMatrix, cgl.mMatrix, this.addTranslate);\n\n        if (this.addMulMat) mat4.mul(cgl.mMatrix, cgl.mMatrix, this.addMulMat);\n\n        mat4.copy(this.absMat, cgl.mMatrix);\n    }\n\n    render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time)\n    {\n        if (!dontTransform) cgl.pushModelMatrix();\n\n        if (_time === undefined) _time = gltf.time;\n\n        if (!dontTransform || this.skinRenderer) this.transform(cgl, _time);\n\n        if (this.hidden && !drawHidden)\n        {\n        }\n        else\n        {\n            if (this.skinRenderer)\n            {\n                this.skinRenderer.time = _time;\n                if (!dontDrawMesh)\n                    this.mesh.render(cgl, ignoreMaterial, this.skinRenderer, _time, this.weights);\n            }\n            else\n            {\n                if (this.mesh && !dontDrawMesh)\n                    this.mesh.render(cgl, ignoreMaterial, null, _time, this.weights);\n            }\n        }\n\n        if (!ignoreChilds && !this.hidden)\n            for (let i = 0; i < this.children.length; i++)\n                if (gltf.nodes[this.children[i]])\n                    gltf.nodes[this.children[i]].render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time);\n\n        if (!dontTransform)cgl.popModelMatrix();\n    }\n};\n","inc_print_js":"let tab = null;\nlet maxChilds = 100;\n\nfunction closeTab()\n{\n    if (tab)gui.mainTabs.closeTab(tab.id);\n    tab = null;\n}\n\nfunction formatVec(arr)\n{\n    const nums = [];\n    for (let i = 0; i < arr.length; i++)\n    {\n        nums.push(Math.round(arr[i] * 1000) / 1000);\n    }\n\n    return nums.join(\",\");\n}\n\nop.toggleShowAll = () =>\n{\n    if (maxChilds == 100)maxChilds = 9999999;\n    else maxChilds = 100;\n    closeTab();\n    printInfo();\n    console.log(\"maxChilds\", maxChilds);\n};\n\nfunction printNode(html, node, level)\n{\n    if (!gltf) return;\n\n    html += \"<tr class=\\\"row\\\">\";\n\n    let ident = \"\";\n    let identSpace = \"\";\n\n    for (let i = 1; i < level; i++)\n    {\n        identSpace += \"&nbsp;&nbsp;&nbsp;\";\n        let identClass = \"identBg\";\n        if (i == 1)identClass = \"identBgLevel0\";\n        ident += \"<td class=\\\"ident \" + identClass + \"\\\" ><div style=\\\"\\\"></div></td>\";\n    }\n    let id = CABLES.uuid();\n    html += ident;\n    html += \"<td colspan=\\\"\" + (21 - level) + \"\\\">\";\n\n    if (node.mesh && node.mesh.meshes.length)html += \"<span class=\\\"icon icon-cube\\\"></span>&nbsp;\";\n    else html += \"<span class=\\\"icon icon-box-select\\\"></span> &nbsp;\";\n\n    html += node.name + \"</td><td></td>\";\n\n    if (node.mesh)\n    {\n        html += \"<td>\";\n        for (let i = 0; i < node.mesh.meshes.length; i++)\n        {\n            if (i > 0)html += \", \";\n            html += node.mesh.meshes[i].name || \"\";\n        }\n\n        html += \"</td>\";\n\n        html += \"<td>\";\n        html += node.hasSkin() || \"-\";\n        html += \"</td>\";\n\n        html += \"<td>\";\n        let countMats = 0;\n        for (let i = 0; i < node.mesh.meshes.length; i++)\n        {\n            if (countMats > 0)html += \", \";\n            if (gltf.json.materials && node.mesh.meshes[i].hasOwnProperty(\"material\"))\n            {\n                if (gltf.json.materials[node.mesh.meshes[i].material])\n                {\n                    html += gltf.json.materials[node.mesh.meshes[i].material].name || \"\";\n                    countMats++;\n                }\n            }\n        }\n        if (countMats == 0)html += \"none\";\n        html += \"</td>\";\n    }\n    else\n    {\n        html += \"<td>-</td><td>-</td><td>-</td>\";\n    }\n\n    html += \"<td>\";\n\n    if (node._node.translation || node._node.rotation || node._node.scale)\n    {\n        let info = \"\";\n\n        if (node._node.translation)info += \"Translate: `\" + formatVec(node._node.translation) + \"` || \";\n        if (node._node.rotation)info += \"Rotation: `\" + formatVec(node._node.rotation) + \"` || \";\n        if (node._node.scale)info += \"Scale: `\" + formatVec(node._node.scale) + \"` || \";\n\n        html += \"<span class=\\\"icon icon-gizmo info\\\" data-info=\\\"\" + info + \"\\\"></span> &nbsp;\";\n    }\n\n    if (node._animRot || node._animScale || node._animTrans)\n    {\n        let info = \"Animated: \";\n        if (node._animRot) info += \"Rot \";\n        if (node._animScale) info += \"Scale \";\n        if (node._animTrans) info += \"Trans \";\n\n        html += \"<span class=\\\"icon icon-clock info\\\" data-info=\\\"\" + info + \"\\\"></span>&nbsp;\";\n    }\n\n    if (!node._node.translation && !node._node.rotation && !node._node.scale && !node._animRot && !node._animScale && !node._animTrans) html += \"-\";\n\n    html += \"</td>\";\n\n    html += \"<td>\";\n    let hideclass = \"\";\n    if (node.hidden)hideclass = \"node-hidden\";\n\n    html += \"<a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').exposeNode('\" + node.name + \"','transform')\\\" class=\\\"treebutton\\\">Transform</a>\";\n    html += \" <a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').exposeNode('\" + node.name + \"','hierarchy')\\\" class=\\\"treebutton\\\">Hierarchy</a>\";\n    html += \" <a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').exposeNode('\" + node.name + \"')\\\" class=\\\"treebutton\\\">Node</a>\";\n\n    if (node.hasSkin())\n        html += \" <a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').exposeNode('\" + node.name + \"',false,{skin:true});\\\" class=\\\"treebutton\\\">Skin</a>\";\n\n    html += \"</td><td>\";\n    html += \"&nbsp;<span class=\\\"icon iconhover icon-eye \" + hideclass + \"\\\" onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').toggleNodeVisibility('\" + node.name + \"');this.classList.toggle('node-hidden');\\\"></span>\";\n    html += \"</td>\";\n\n    html += \"</tr>\";\n\n    for (let i = 0; i < Math.min(maxChilds, node.children.length); i++)\n        html = printNode(html, gltf.nodes[node.children[i]], level + 1);\n\n    if (node.children.length > maxChilds)\n        html += \"<tr ><td></td><td colspan=\\\"14\\\"><br/><br/><a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').toggleShowAll()\\\" class=\\\"button-small\\\">...and many more</a><br/><br/><br/></td></tr>\";\n\n    return html;\n}\n\nfunction printMaterial(mat, idx)\n{\n    let html = \"<tr>\";\n    html += \" <td>\" + idx + \"</td>\";\n    html += \" <td>\" + mat.name + \"</td>\";\n    html += \" <td>\";\n\n    const info = JSON.stringify(mat, null, 4).replaceAll(\"\\\"\", \"\").replaceAll(\"\\n\", \"<br/>\");\n\n    html += \"<span class=\\\"icon icon-info\\\" onclick=\\\"new CABLES.UI.ModalDialog({ 'html': '<pre>\" + info + \"</pre>', 'title': '\" + mat.name + \"' });\\\"></span>&nbsp;\";\n\n    if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor)\n    {\n        let rgb = \"\";\n        rgb += \"\" + Math.round(mat.pbrMetallicRoughness.baseColorFactor[0] * 255);\n        rgb += \",\" + Math.round(mat.pbrMetallicRoughness.baseColorFactor[1] * 255);\n        rgb += \",\" + Math.round(mat.pbrMetallicRoughness.baseColorFactor[2] * 255);\n\n        html += \"<div style=\\\"width:15px;height:15px;background-color:rgb(\" + rgb + \");display:inline-block\\\">&nbsp;</a>\";\n    }\n    html += \"<td style=\\\"\\\">\" + (gltf.shaders[idx] ? \"-\" : \"<a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').assignMaterial('\" + mat.name + \"')\\\" class=\\\"treebutton\\\">Assign</a>\") + \"<td>\";\n    html += \"<td>\";\n\n    html += \"</tr>\";\n    return html;\n}\n\nfunction printInfo()\n{\n    if (!gltf) return;\n\n    const startTime = performance.now();\n    const sizes = {};\n    let html = \"<div style=\\\"overflow:scroll;width:100%;height:100%\\\">\";\n\n    html += \"File: <a href=\\\"\" + CABLES.platform.getCablesUrl() + \"/asset/patches/?filename=\" + inFile.get() + \"\\\" target=\\\"_blank\\\">\" + CABLES.basename(inFile.get()) + \"</a><br/>\";\n\n    html += \"Generator: \" + gltf.json.asset.generator + \"<br/>\";\n    html += \"Extensions: \" + (gltf.json.extensionsUsed || []).join(\",\") + \"<br/>\";\n\n    let numNodes = 0;\n    if (gltf.json.nodes)numNodes = gltf.json.nodes.length;\n    html += \"<div id=\\\"groupNodes\\\">Nodes (\" + numNodes + \")</div>\";\n\n    html += \"<table id=\\\"sectionNodes\\\" class=\\\"table treetable\\\">\";\n\n    html += \"<tr>\";\n    html += \" <th colspan=\\\"21\\\">Name</th>\";\n    html += \" <th>Mesh</th>\";\n    html += \" <th>Skin</th>\";\n    html += \" <th>Material</th>\";\n    html += \" <th>Transform</th>\";\n    html += \" <th>Expose</th>\";\n    html += \" <th></th>\";\n    html += \"</tr>\";\n\n    for (let i = 0; i < gltf.nodes.length; i++)\n    {\n        if (!gltf.nodes[i].isChild)\n            html = printNode(html, gltf.nodes[i], 1);\n    }\n    html += \"</table>\";\n\n    // / //////////////////\n\n    let numMaterials = 0;\n    if (gltf.json.materials)numMaterials = gltf.json.materials.length;\n    html += \"<div id=\\\"groupMaterials\\\">Materials (\" + numMaterials + \")</div>\";\n\n    if (!gltf.json.materials || gltf.json.materials.length == 0)\n    {\n    }\n    else\n    {\n        html += \"<table id=\\\"materialtable\\\"  class=\\\"table treetable\\\">\";\n        html += \"<tr>\";\n        html += \" <th>Index</th>\";\n        html += \" <th>Name</th>\";\n        html += \" <th>Color</th>\";\n        html += \" <th>Function</th>\";\n        html += \" <th></th>\";\n        html += \"</tr>\";\n        for (let i = 0; i < gltf.json.materials.length; i++)\n        {\n            html += printMaterial(gltf.json.materials[i], i);\n        }\n        html += \"</table>\";\n    }\n\n    // / ///////////////////////\n\n    html += \"<div id=\\\"groupMeshes\\\">Mesh Geometries (\" + gltf.json.meshes.length + \")</div>\";\n\n    html += \"<table id=\\\"meshestable\\\"  class=\\\"table treetable\\\">\";\n    html += \"<tr>\";\n    html += \" <th>Name</th>\";\n    html += \" <th>Node</th>\";\n    html += \" <th>Material</th>\";\n    html += \" <th>Vertices</th>\";\n    html += \" <th>Attributes</th>\";\n    html += \"</tr>\";\n\n    let sizeBufferViews = [];\n    sizes.meshes = 0;\n    sizes.meshTargets = 0;\n\n    for (let i = 0; i < gltf.json.meshes.length; i++)\n    {\n        html += \"<tr>\";\n        html += \"<td>\" + gltf.json.meshes[i].name || \"?\" + \"</td>\";\n\n        html += \"<td>\";\n        let count = 0;\n        let nodename = \"\";\n        if (gltf.json.nodes)\n            for (let j = 0; j < gltf.json.nodes.length; j++)\n            {\n                if (gltf.json.nodes[j].mesh == i)\n                {\n                    count++;\n                    if (count == 1)\n                    {\n                        nodename = gltf.json.nodes[j].name;\n                    }\n                }\n            }\n        if (count > 1) html += (count) + \" nodes (\" + nodename + \" ...)\";\n        else html += nodename || \"\";\n        html += \"</td>\";\n\n        // -------\n\n        html += \"<td>\";\n        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)\n        {\n            if (gltf.json.meshes[i].primitives[j].hasOwnProperty(\"material\"))\n            {\n                if (gltf.json.materials[gltf.json.meshes[i]])\n                {\n                    html += (gltf.json.materials[gltf.json.meshes[i].primitives[j].material].name || \"-\") + \" \";\n                }\n            }\n            else html += \"None\";\n        }\n        html += \"</td>\";\n\n        html += \"<td>\";\n        let numVerts = 0;\n        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)\n        {\n            if (gltf.json.meshes[i].primitives[j].attributes.POSITION != undefined)\n            {\n                let v = parseInt(gltf.json.accessors[gltf.json.meshes[i].primitives[j].attributes.POSITION].count);\n                numVerts += v;\n                html += \"\" + v + \"<br/>\";\n            }\n            else html += \"-<br/>\";\n        }\n\n        if (gltf.json.meshes[i].primitives.length > 1)\n            html += \"=\" + numVerts;\n        html += \"</td>\";\n\n        html += \"<td>\";\n        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)\n        {\n            html += Object.keys(gltf.json.meshes[i].primitives[j].attributes);\n            html += \" <a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').exposeGeom('\" + gltf.json.meshes[i].name + \"',\" + j + \")\\\" class=\\\"treebutton\\\">Geometry</a>\";\n            html += \"<br/>\";\n\n            if (gltf.json.meshes[i].primitives[j].targets)\n            {\n                html += gltf.json.meshes[i].primitives[j].targets.length + \" targets<br/>\";\n\n                if (gltf.json.meshes[i].extras && gltf.json.meshes[i].extras.targetNames)\n                    html += \"Targetnames:<br/>\" + gltf.json.meshes[i].extras.targetNames.join(\"<br/>\");\n\n                html += \"<br/>\";\n            }\n        }\n\n        html += \"</td>\";\n        html += \"</tr>\";\n\n        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)\n        {\n            const accessor = gltf.json.accessors[gltf.json.meshes[i].primitives[j].indices];\n            if (accessor)\n            {\n                let bufView = accessor.bufferView;\n\n                if (sizeBufferViews.indexOf(bufView) == -1)\n                {\n                    sizeBufferViews.push(bufView);\n                    if (gltf.json.bufferViews[bufView])sizes.meshes += gltf.json.bufferViews[bufView].byteLength;\n                }\n            }\n\n            for (let k in gltf.json.meshes[i].primitives[j].attributes)\n            {\n                const attr = gltf.json.meshes[i].primitives[j].attributes[k];\n                const bufView2 = gltf.json.accessors[attr].bufferView;\n\n                if (sizeBufferViews.indexOf(bufView2) == -1)\n                {\n                    sizeBufferViews.push(bufView2);\n                    if (gltf.json.bufferViews[bufView2])sizes.meshes += gltf.json.bufferViews[bufView2].byteLength;\n                }\n            }\n\n            if (gltf.json.meshes[i].primitives[j].targets)\n                for (let k = 0; k < gltf.json.meshes[i].primitives[j].targets.length; k++)\n                {\n                    for (let l in gltf.json.meshes[i].primitives[j].targets[k])\n                    {\n                        const accessorIdx = gltf.json.meshes[i].primitives[j].targets[k][l];\n                        const accessor = gltf.json.accessors[accessorIdx];\n                        const bufView2 = accessor.bufferView;\n                        console.log(\"accessor\", accessor);\n                        if (sizeBufferViews.indexOf(bufView2) == -1)\n                            if (gltf.json.bufferViews[bufView2])\n                            {\n                                sizeBufferViews.push(bufView2);\n                                sizes.meshTargets += gltf.json.bufferViews[bufView2].byteLength;\n                            }\n                    }\n                }\n        }\n    }\n    html += \"</table>\";\n\n    // / //////////////////////////////////\n\n    let numSamplers = 0;\n    let numAnims = 0;\n    let numKeyframes = 0;\n\n    if (gltf.json.animations)\n    {\n        numAnims = gltf.json.animations.length;\n        for (let i = 0; i < gltf.json.animations.length; i++)\n        {\n            numSamplers += gltf.json.animations[i].samplers.length;\n        }\n    }\n\n    html += \"<div id=\\\"groupAnims\\\">Animations (\" + numAnims + \"/\" + numSamplers + \")</div>\";\n\n    if (gltf.json.animations)\n    {\n        html += \"<table id=\\\"sectionAnim\\\" class=\\\"table treetable\\\">\";\n        html += \"<tr>\";\n        html += \"  <th>Name</th>\";\n        html += \"  <th>Target node</th>\";\n        html += \"  <th>Path</th>\";\n        html += \"  <th>Interpolation</th>\";\n        html += \"  <th>Keys</th>\";\n        html += \"</tr>\";\n\n        sizes.animations = 0;\n\n        for (let i = 0; i < gltf.json.animations.length; i++)\n        {\n            for (let j = 0; j < gltf.json.animations[i].samplers.length; j++)\n            {\n                let bufView = gltf.json.accessors[gltf.json.animations[i].samplers[j].input].bufferView;\n                if (sizeBufferViews.indexOf(bufView) == -1)\n                {\n                    sizeBufferViews.push(bufView);\n                    sizes.animations += gltf.json.bufferViews[bufView].byteLength;\n                }\n\n                bufView = gltf.json.accessors[gltf.json.animations[i].samplers[j].output].bufferView;\n                if (sizeBufferViews.indexOf(bufView) == -1)\n                {\n                    sizeBufferViews.push(bufView);\n                    sizes.animations += gltf.json.bufferViews[bufView].byteLength;\n                }\n            }\n\n            for (let j = 0; j < gltf.json.animations[i].channels.length; j++)\n            {\n                html += \"<tr>\";\n                html += \"  <td> Anim \" + i + \": \" + gltf.json.animations[i].name + \"</td>\";\n\n                html += \"  <td>\" + gltf.nodes[gltf.json.animations[i].channels[j].target.node].name + \"</td>\";\n                html += \"  <td>\";\n                html += gltf.json.animations[i].channels[j].target.path + \" \";\n                html += \"  </td>\";\n\n                const smplidx = gltf.json.animations[i].channels[j].sampler;\n                const smplr = gltf.json.animations[i].samplers[smplidx];\n\n                html += \"  <td>\" + smplr.interpolation + \"</td>\";\n\n                html += \"  <td>\" + gltf.json.accessors[smplr.output].count;\n                numKeyframes += gltf.json.accessors[smplr.output].count;\n\n                // html += \"&nbsp;&nbsp;<a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').showAnim('\" + i + \"','\" + j + \"')\\\" class=\\\"icon icon-search\\\"></a>\";\n\n                html += \"</td>\";\n\n                html += \"</tr>\";\n            }\n        }\n\n        html += \"<tr>\";\n        html += \"  <td></td>\";\n        html += \"  <td></td>\";\n        html += \"  <td></td>\";\n        html += \"  <td></td>\";\n        html += \"  <td>\" + numKeyframes + \" total</td>\";\n        html += \"</tr>\";\n        html += \"</table>\";\n    }\n    else\n    {\n\n    }\n\n    // / ///////////////////\n\n    let numImages = 0;\n    if (gltf.json.images)numImages = gltf.json.images.length;\n    html += \"<div id=\\\"groupImages\\\">Images (\" + numImages + \")</div>\";\n\n    if (gltf.json.images)\n    {\n        html += \"<table id=\\\"sectionImages\\\" class=\\\"table treetable\\\">\";\n\n        html += \"<tr>\";\n        html += \"  <th>name</th>\";\n        html += \"  <th>type</th>\";\n        html += \"  <th>func</th>\";\n        html += \"</tr>\";\n\n        sizes.images = 0;\n\n        for (let i = 0; i < gltf.json.images.length; i++)\n        {\n            if (gltf.json.images[i].hasOwnProperty(\"bufferView\"))\n            {\n                // if (sizeBufferViews.indexOf(gltf.json.images[i].hasOwnProperty(\"bufferView\")) == -1)console.log(\"image bufferview already there?!\");\n                // else\n                sizes.images += gltf.json.bufferViews[gltf.json.images[i].bufferView].byteLength;\n            }\n            else console.log(\"image has no bufferview?!\");\n\n            html += \"<tr>\";\n            html += \"<td>\" + gltf.json.images[i].name + \"</td>\";\n            html += \"<td>\" + gltf.json.images[i].mimeType + \"</td>\";\n            html += \"<td>\";\n\n            let name = gltf.json.images[i].name;\n            if (name === undefined)name = gltf.json.images[i].bufferView;\n\n            html += \"<a onclick=\\\"gui.corePatch().getOpById('\" + op.id + \"').exposeTexture('\" + name + \"')\\\" class=\\\"treebutton\\\">Expose</a>\";\n            html += \"</td>\";\n\n            html += \"<tr>\";\n        }\n        html += \"</table>\";\n    }\n\n    // / ///////////////////////\n\n    let numCameras = 0;\n    if (gltf.json.cameras)numCameras = gltf.json.cameras.length;\n    html += \"<div id=\\\"groupCameras\\\">Cameras (\" + numCameras + \")</div>\";\n\n    if (gltf.json.cameras)\n    {\n        html += \"<table id=\\\"sectionCameras\\\" class=\\\"table treetable\\\">\";\n\n        html += \"<tr>\";\n        html += \"  <th>name</th>\";\n        html += \"  <th>type</th>\";\n        html += \"  <th>info</th>\";\n        html += \"</tr>\";\n\n        for (let i = 0; i < gltf.json.cameras.length; i++)\n        {\n            html += \"<tr>\";\n            html += \"<td>\" + gltf.json.cameras[i].name + \"</td>\";\n            html += \"<td>\" + gltf.json.cameras[i].type + \"</td>\";\n            html += \"<td>\";\n\n            if (gltf.json.cameras[i].perspective)\n            {\n                html += \"yfov: \" + Math.round(gltf.json.cameras[i].perspective.yfov * 100) / 100;\n                html += \", \";\n                html += \"zfar: \" + Math.round(gltf.json.cameras[i].perspective.zfar * 100) / 100;\n                html += \", \";\n                html += \"znear: \" + Math.round(gltf.json.cameras[i].perspective.znear * 100) / 100;\n            }\n            html += \"</td>\";\n\n            html += \"<tr>\";\n        }\n        html += \"</table>\";\n    }\n\n    // / ////////////////////////////////////\n\n    let numSkins = 0;\n    if (gltf.json.skins)numSkins = gltf.json.skins.length;\n    html += \"<div id=\\\"groupSkins\\\">Skins (\" + numSkins + \")</div>\";\n\n    if (gltf.json.skins)\n    {\n        // html += \"<h3>Skins (\" + gltf.json.skins.length + \")</h3>\";\n        html += \"<table id=\\\"sectionSkins\\\" class=\\\"table treetable\\\">\";\n\n        html += \"<tr>\";\n        html += \"  <th>name</th>\";\n        html += \"  <th></th>\";\n        html += \"  <th>total joints</th>\";\n        html += \"</tr>\";\n\n        for (let i = 0; i < gltf.json.skins.length; i++)\n        {\n            html += \"<tr>\";\n            html += \"<td>\" + gltf.json.skins[i].name + \"</td>\";\n            html += \"<td>\" + \"</td>\";\n            html += \"<td>\" + gltf.json.skins[i].joints.length + \"</td>\";\n            html += \"<td>\";\n            html += \"</td>\";\n            html += \"<tr>\";\n        }\n        html += \"</table>\";\n    }\n\n    // / ////////////////////////////////////\n\n    if (gltf.timing)\n    {\n        html += \"<div id=\\\"groupTiming\\\">Debug Loading Timing </div>\";\n\n        html += \"<table id=\\\"sectionTiming\\\" class=\\\"table treetable\\\">\";\n\n        html += \"<tr>\";\n        html += \"  <th>task</th>\";\n        html += \"  <th>time used</th>\";\n        html += \"</tr>\";\n\n        let lt = 0;\n        for (let i = 0; i < gltf.timing.length - 1; i++)\n        {\n            html += \"<tr>\";\n            html += \"  <td>\" + gltf.timing[i][0] + \"</td>\";\n            html += \"  <td>\" + (gltf.timing[i + 1][1] - gltf.timing[i][1]) + \" ms</td>\";\n            html += \"</tr>\";\n            // lt = gltf.timing[i][1];\n        }\n        html += \"</table>\";\n    }\n\n    // / //////////////////////////\n\n    let sizeBin = 0;\n    if (gltf.json.buffers)\n        sizeBin = gltf.json.buffers[0].byteLength;\n\n    html += \"<div id=\\\"groupBinary\\\">File Size Allocation (\" + Math.round(sizeBin / 1024) + \"k )</div>\";\n\n    html += \"<table id=\\\"sectionBinary\\\" class=\\\"table treetable\\\">\";\n    html += \"<tr>\";\n    html += \"  <th>name</th>\";\n    html += \"  <th>size</th>\";\n    html += \"  <th>%</th>\";\n    html += \"</tr>\";\n    let sizeUnknown = sizeBin;\n    for (let i in sizes)\n    {\n        // html+=i+':'+Math.round(sizes[i]/1024);\n        html += \"<tr>\";\n        html += \"<td>\" + i + \"</td>\";\n        html += \"<td>\" + readableSize(sizes[i]) + \" </td>\";\n        html += \"<td>\" + Math.round(sizes[i] / sizeBin * 100) + \"% </td>\";\n        html += \"<tr>\";\n        sizeUnknown -= sizes[i];\n    }\n\n    if (sizeUnknown != 0)\n    {\n        html += \"<tr>\";\n        html += \"<td>unknown</td>\";\n        html += \"<td>\" + readableSize(sizeUnknown) + \" </td>\";\n        html += \"<td>\" + Math.round(sizeUnknown / sizeBin * 100) + \"% </td>\";\n        html += \"<tr>\";\n    }\n\n    html += \"</table>\";\n    html += \"</div>\";\n\n    tab = new CABLES.UI.Tab(\"GLTF \" + CABLES.basename(inFile.get()), { \"icon\": \"cube\", \"infotext\": \"tab_gltf\", \"padding\": true, \"singleton\": true });\n    gui.mainTabs.addTab(tab, true);\n\n    tab.addEventListener(\"close\", closeTab);\n    tab.html(html);\n\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupNodes\"), ele.byId(\"sectionNodes\"), false);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupMaterials\"), ele.byId(\"materialtable\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupAnims\"), ele.byId(\"sectionAnim\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupMeshes\"), ele.byId(\"meshestable\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupCameras\"), ele.byId(\"sectionCameras\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupImages\"), ele.byId(\"sectionImages\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupSkins\"), ele.byId(\"sectionSkins\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupBinary\"), ele.byId(\"sectionBinary\"), true);\n    CABLES.UI.Collapsable.setup(ele.byId(\"groupTiming\"), ele.byId(\"sectionTiming\"), true);\n\n    gui.maintabPanel.show(true);\n}\n\nfunction readableSize(n)\n{\n    if (n > 1024) return Math.round(n / 1024) + \" kb\";\n    if (n > 1024 * 500) return Math.round(n / 1024) + \" mb\";\n    else return n + \" bytes\";\n}\n","inc_skin_js":"const GltfSkin = class\n{\n    constructor(node)\n    {\n        this._mod = null;\n        this._node = node;\n        this._lastTime = 0;\n        this._matArr = [];\n        this._m = mat4.create();\n        this._invBindMatrix = mat4.create();\n        this.identity = true;\n    }\n\n    renderFinish(cgl)\n    {\n        cgl.popModelMatrix();\n        this._mod.unbind();\n    }\n\n    renderStart(cgl, time)\n    {\n        if (!this._mod)\n        {\n            this._mod = new CGL.ShaderModifier(cgl, op.name + this._node.name);\n\n            this._mod.addModule({\n                \"priority\": -2,\n                \"name\": \"MODULE_VERTEX_POSITION\",\n                \"srcHeadVert\": attachments.skin_head_vert || \"\",\n                \"srcBodyVert\": attachments.skin_vert || \"\"\n            });\n\n            this._mod.addUniformVert(\"m4[]\", \"MOD_boneMats\", []);// bohnenmatze\n            const tr = vec3.create();\n        }\n\n        const skinIdx = this._node.skin;\n        const arrLength = gltf.json.skins[skinIdx].joints.length * 16;\n\n        // if (this._lastTime != time || !time)\n        {\n            // this._lastTime=inTime.get();\n            if (this._matArr.length != arrLength) this._matArr.length = arrLength;\n\n            for (let i = 0; i < gltf.json.skins[skinIdx].joints.length; i++)\n            {\n                const i16 = i * 16;\n                const jointIdx = gltf.json.skins[skinIdx].joints[i];\n                const nodeJoint = gltf.nodes[jointIdx];\n\n                for (let j = 0; j < 16; j++)\n                    this._invBindMatrix[j] = gltf.accBuffers[gltf.json.skins[skinIdx].inverseBindMatrices][i16 + j];\n\n                mat4.mul(this._m, nodeJoint.modelMatAbs(), this._invBindMatrix);\n\n                for (let j = 0; j < this._m.length; j++) this._matArr[i16 + j] = this._m[j];\n            }\n\n            this._mod.setUniformValue(\"MOD_boneMats\", this._matArr);\n            this._lastTime = time;\n        }\n\n        this._mod.define(\"SKIN_NUM_BONES\", gltf.json.skins[skinIdx].joints.length);\n        this._mod.bind();\n\n        // draw mesh...\n        cgl.pushModelMatrix();\n        if (this.identity)mat4.identity(cgl.mMatrix);\n    }\n};\n","inc_targets_js":"const GltfTargetsRenderer = class\n{\n    constructor(mesh)\n    {\n        this.mesh = mesh;\n        this.tex = null;\n        this.numRowsPerTarget = 0;\n\n        this.makeTex(mesh.geom);\n    }\n\n    renderFinish(cgl)\n    {\n        if (!cgl.gl) return;\n        cgl.popModelMatrix();\n        this._mod.unbind();\n    }\n\n    renderStart(cgl, time)\n    {\n        if (!cgl.gl) return;\n        if (!this._mod)\n        {\n            this._mod = new CGL.ShaderModifier(cgl, \"gltftarget\");\n\n            this._mod.addModule({\n                \"priority\": -2,\n                \"name\": \"MODULE_VERTEX_POSITION\",\n                \"srcHeadVert\": attachments.targets_head_vert || \"\",\n                \"srcBodyVert\": attachments.targets_vert || \"\"\n            });\n\n            this._mod.addUniformVert(\"4f\", \"MOD_targetTexInfo\", [0, 0, 0, 0]);\n            this._mod.addUniformVert(\"t\", \"MOD_targetTex\", 1);\n            this._mod.addUniformVert(\"f[]\", \"MOD_weights\", []);\n\n            const tr = vec3.create();\n        }\n\n        this._mod.pushTexture(\"MOD_targetTex\", this.tex);\n        if (this.tex && this.mesh.weights)\n        {\n            this._mod.setUniformValue(\"MOD_weights\", this.mesh.weights);\n            this._mod.setUniformValue(\"MOD_targetTexInfo\", [this.tex.width, this.tex.height, this.numRowsPerTarget, this.mesh.weights.length]);\n\n            this._mod.define(\"MOD_NUM_WEIGHTS\", Math.max(1, this.mesh.weights.length));\n        }\n        else\n        {\n            this._mod.define(\"MOD_NUM_WEIGHTS\", 1);\n        }\n        this._mod.bind();\n\n        // draw mesh...\n        cgl.pushModelMatrix();\n        if (this.identity)mat4.identity(cgl.mMatrix);\n    }\n\n    makeTex(geom)\n    {\n        if (!cgl.gl) return;\n\n        if (!geom.morphTargets || !geom.morphTargets.length) return console.log(\"no morphtargets\");\n\n        let w = geom.morphTargets[0].vertices.length / 3;\n        let h = 0;\n        this.numRowsPerTarget = 0;\n\n        const gl = cgl.gl;\n        if (w > gl.getParameter(gl.MAX_TEXTURE_SIZE) || h > gl.getParameter(gl.MAX_TEXTURE_SIZE))\n        {\n            console.error(\"gltf morph texture size too big...\");\n            op.setUiError(\"mtt\", \"morphtarget texture bigger then browser max texture size \" + w + \">\" + gl.getParameter(gl.MAX_TEXTURE_SIZE), 1);\n        }\n        else\n        {\n            op.setUiError(\"mtt\", null, 1);\n        }\n\n        w = Math.min(w, gl.getParameter(gl.MAX_TEXTURE_SIZE) - 1);\n        h = Math.min(h, gl.getParameter(gl.MAX_TEXTURE_SIZE) - 1);\n\n        if (geom.morphTargets[0].vertices && geom.morphTargets[0].vertices.length) this.numRowsPerTarget++;\n        if (geom.morphTargets[0].vertexNormals && geom.morphTargets[0].vertexNormals.length) this.numRowsPerTarget++;\n        if (geom.morphTargets[0].tangents && geom.morphTargets[0].tangents.length) this.numRowsPerTarget++;\n        if (geom.morphTargets[0].bitangents && geom.morphTargets[0].bitangents.length) this.numRowsPerTarget++;\n\n        h = geom.morphTargets.length * this.numRowsPerTarget;\n\n        // console.log(\"this.numRowsPerTarget\", this.numRowsPerTarget);\n\n        const pixels = new Float32Array(w * h * 4);\n        let row = 0;\n\n        for (let i = 0; i < geom.morphTargets.length; i++)\n        {\n            if (geom.morphTargets[i].vertices && geom.morphTargets[i].vertices.length)\n            {\n                for (let j = 0; j < geom.morphTargets[i].vertices.length; j += 3)\n                {\n                    pixels[((row * w) + (j / 3)) * 4 + 0] = geom.morphTargets[i].vertices[j + 0];\n                    pixels[((row * w) + (j / 3)) * 4 + 1] = geom.morphTargets[i].vertices[j + 1];\n                    pixels[((row * w) + (j / 3)) * 4 + 2] = geom.morphTargets[i].vertices[j + 2];\n                    pixels[((row * w) + (j / 3)) * 4 + 3] = 1;\n                }\n                row++;\n            }\n\n            if (geom.morphTargets[i].vertexNormals && geom.morphTargets[i].vertexNormals.length)\n            {\n                for (let j = 0; j < geom.morphTargets[i].vertexNormals.length; j += 3)\n                {\n                    pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].vertexNormals[j + 0];\n                    pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].vertexNormals[j + 1];\n                    pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].vertexNormals[j + 2];\n                    pixels[(row * w + j / 3) * 4 + 3] = 1;\n                }\n\n                row++;\n            }\n\n            if (geom.morphTargets[i].tangents && geom.morphTargets[i].tangents.length)\n            {\n                for (let j = 0; j < geom.morphTargets[i].tangents.length; j += 3)\n                {\n                    pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].tangents[j + 0];\n                    pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].tangents[j + 1];\n                    pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].tangents[j + 2];\n                    pixels[(row * w + j / 3) * 4 + 3] = 1;\n                }\n                row++;\n            }\n\n            if (geom.morphTargets[i].bitangents && geom.morphTargets[i].bitangents.length)\n            {\n                for (let j = 0; j < geom.morphTargets[i].bitangents.length; j += 3)\n                {\n                    pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].bitangents[j + 0];\n                    pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].bitangents[j + 1];\n                    pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].bitangents[j + 2];\n                    pixels[(row * w + j / 3) * 4 + 3] = 1;\n                }\n                row++;\n            }\n        }\n\n        this.tex = new CGL.Texture(cgl, { \"isFloatingPointTexture\": true, \"name\": \"targetsTexture\" });\n\n        this.tex.initFromData(pixels, w, h, CGL.Texture.FILTER_LINEAR, CGL.Texture.WRAP_REPEAT);\n\n        // console.log(\"morphTargets generated texture\", w, h);\n    }\n};\n","skin_vert":"int index=int(attrJoints.x);\nvec4 newPos = (MOD_boneMats[index] * pos) * attrWeights.x;\nvec3 newNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.x).xyz);\n\nindex=int(attrJoints.y);\nnewPos += (MOD_boneMats[index] * pos) * attrWeights.y;\nnewNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.y).xyz)+newNorm;\n\nindex=int(attrJoints.z);\nnewPos += (MOD_boneMats[index] * pos) * attrWeights.z;\nnewNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.z).xyz)+newNorm;\n\nindex=int(attrJoints.w);\nnewPos += (MOD_boneMats[index] * pos) * attrWeights.w ;\nnewNorm = (vec4((MOD_boneMats[index] * vec4(norm.xyz, 0.0)) * attrWeights.w).xyz)+newNorm;\n\npos=newPos;\n\nnorm=normalize(newNorm.xyz);\n\n\n","skin_head_vert":"\nIN vec4 attrWeights;\nIN vec4 attrJoints;\nUNI mat4 MOD_boneMats[SKIN_NUM_BONES];\n","targets_vert":"\n\nfloat MOD_width=MOD_targetTexInfo.x;\nfloat MOD_height=MOD_targetTexInfo.y;\nfloat MOD_numTargets=MOD_targetTexInfo.w;\nfloat MOD_numLinesPerTarget=MOD_height/MOD_numTargets;\n\nfloat halfpix=(1.0/MOD_width)*0.5;\nfloat halfpixy=(1.0/MOD_height)*0.5;\n\nfloat x=(attrVertIndex)/MOD_width+halfpix;\n\nvec3 off=vec3(0.0);\n\nfor(float i=0.0;i<MOD_numTargets;i+=1.0)\n{\n    float y=1.0-((MOD_numLinesPerTarget*i)/MOD_height+halfpixy);\n    vec2 coord=vec2(x,y);\n    vec3 targetXYZ = texture(MOD_targetTex,coord).xyz;\n\n    off+=(targetXYZ*MOD_weights[int(i)]);\n\n\n\n    coord.y+=1.0/MOD_height; // normals are in next row\n    vec3 targetNormal = texture(MOD_targetTex,coord).xyz;\n    norm+=targetNormal*MOD_weights[int(i)];\n\n\n}\n\n// norm=normalize(norm);\npos.xyz+=off;\n","targets_head_vert":"\nUNI float MOD_weights[MOD_NUM_WEIGHTS];\n",};
const gltfCamera = class
{
    constructor(gltf, node)
    {
        this.node = node;
        this.name = node.name;
        // console.log(gltf);
        this.config = gltf.json.cameras[node.camera];

        this.pos = vec3.create();
        this.quat = quat.create();
        this.vCenter = vec3.create();
        this.vUp = vec3.create();
        this.vMat = mat4.create();
    }

    updateAnim(time)
    {
        if (this.node && this.node._animTrans)
        {
            vec3.set(this.pos,
                this.node._animTrans[0].getValue(time),
                this.node._animTrans[1].getValue(time),
                this.node._animTrans[2].getValue(time));

            quat.set(this.quat,
                this.node._animRot[0].getValue(time),
                this.node._animRot[1].getValue(time),
                this.node._animRot[2].getValue(time),
                this.node._animRot[3].getValue(time));
        }
    }

    start(time)
    {
        if (cgl.tempData.shadowPass) return;

        this.updateAnim(time);
        const asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];

        cgl.pushPMatrix();
        // mat4.perspective(
        //     cgl.pMatrix,
        //     this.config.perspective.yfov*0.5,
        //     asp,
        //     this.config.perspective.znear,
        //     this.config.perspective.zfar);

        cgl.pushViewMatrix();
        // mat4.identity(cgl.vMatrix);

        // if(this.node && this.node.parent)
        // {
        //     console.log(this.node.parent)
        // vec3.add(this.pos,this.pos,this.node.parent._node.translation);
        // vec3.sub(this.vCenter,this.vCenter,this.node.parent._node.translation);
        // mat4.translate(cgl.vMatrix,cgl.vMatrix,
        // [
        //     -this.node.parent._node.translation[0],
        //     -this.node.parent._node.translation[1],
        //     -this.node.parent._node.translation[2]
        // ])
        // }

        // vec3.set(this.vUp, 0, 1, 0);
        // vec3.set(this.vCenter, 0, -1, 0);
        // // vec3.set(this.vCenter, 0, 1, 0);
        // vec3.transformQuat(this.vCenter, this.vCenter, this.quat);
        // vec3.normalize(this.vCenter, this.vCenter);
        // vec3.add(this.vCenter, this.vCenter, this.pos);

        // mat4.lookAt(cgl.vMatrix, this.pos, this.vCenter, this.vUp);

        let mv = mat4.create();
        mat4.invert(mv, this.node.modelMatAbs());

        // console.log(this.node.modelMatAbs());

        this.vMat = mv;

        mat4.identity(cgl.vMatrix);
        // console.log(mv);
        mat4.mul(cgl.vMatrix, cgl.vMatrix, mv);
    }

    end()
    {
        if (cgl.tempData.shadowPass) return;
        cgl.popPMatrix();
        cgl.popViewMatrix();
    }
};
const le = true; // little endian

const Gltf = class
{
    constructor()
    {
        this.json = {};
        this.accBuffers = [];
        this.meshes = [];
        this.nodes = [];
        this.shaders = [];
        this.timing = [];
        this.cams = [];
        this.startTime = performance.now();
        this.bounds = new CABLES.CG.BoundingBox();
        this.loaded = Date.now();
        this.accBuffersDelete = [];
    }

    getNode(n)
    {
        for (let i = 0; i < this.nodes.length; i++)
        {
            if (this.nodes[i].name == n) return this.nodes[i];
        }
    }

    getNodes(n)
    {
        const arr = [];
        for (let i = 0; i < this.nodes.length; i++)
        {
            if (this.nodes[i].name == n) arr.push(this.nodes[i]);
        }
        return arr;
    }

    unHideAll()
    {
        for (let i = 0; i < this.nodes.length; i++)
        {
            this.nodes[i].unHide();
        }
    }
};

function Utf8ArrayToStr(array)
{
    if (window.TextDecoder) return new TextDecoder("utf-8").decode(array);

    let out, i, len, c;
    let char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while (i < len)
    {
        c = array[i++];
        switch (c >> 4)
        {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
        case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
        case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
            break;
        }
    }

    return out;
}

function readChunk(dv, bArr, arrayBuffer, offset)
{
    const chunk = {};

    if (offset >= dv.byteLength)
    {
        // op.log("could not read chunk...");
        return;
    }
    chunk.size = dv.getUint32(offset + 0, le);

    // chunk.type = new TextDecoder("utf-8").decode(bArr.subarray(offset+4, offset+4+4));
    chunk.type = Utf8ArrayToStr(bArr.subarray(offset + 4, offset + 4 + 4));

    if (chunk.type == "BIN\0")
    {
        // console.log(chunk.size,arrayBuffer.length,offset);
        // try
        // {
        chunk.dataView = new DataView(arrayBuffer, offset + 8, chunk.size);
        // }
        // catch(e)
        // {
        //     chunk.dataView = null;
        //     console.log(e);
        // }
    }
    else
    if (chunk.type == "JSON")
    {
        const json = Utf8ArrayToStr(bArr.subarray(offset + 8, offset + 8 + chunk.size));

        try
        {
            const obj = JSON.parse(json);
            chunk.data = obj;
            outGenerator.set(obj.asset.generator);
        }
        catch (e)
        {
        }
    }
    else
    {
        op.warn("unknown type", chunk.type);
    }

    return chunk;
}

function loadAnims(gltf)
{
    const uniqueAnimNames = {};
    maxTimeDict = {};

    for (let i = 0; i < gltf.json.animations.length; i++)
    {
        const an = gltf.json.animations[i];

        an.name = an.name || "unknown";

        for (let ia = 0; ia < an.channels.length; ia++)
        {
            const chan = an.channels[ia];

            const node = gltf.nodes[chan.target.node];
            const sampler = an.samplers[chan.sampler];

            const acc = gltf.json.accessors[sampler.input];
            const bufferIn = gltf.accBuffers[sampler.input];

            const accOut = gltf.json.accessors[sampler.output];
            const bufferOut = gltf.accBuffers[sampler.output];

            gltf.accBuffersDelete.push(sampler.output, sampler.input);

            if (bufferIn && bufferOut)
            {
                let numComps = 1;
                if (accOut.type === "VEC2")numComps = 2;
                else if (accOut.type === "VEC3")numComps = 3;
                else if (accOut.type === "VEC4")numComps = 4;
                else if (accOut.type === "SCALAR")
                {
                    numComps = bufferOut.length / bufferIn.length; // is this really the way to find out ? cant find any other way,except number of morph targets, but not really connected...
                }
                else op.log("[] UNKNOWN accOut.type", accOut.type);

                const anims = [];

                uniqueAnimNames[an.name] = true;

                for (let k = 0; k < numComps; k++)
                {
                    const newAnim = new CABLES.Anim();
                    // newAnim.name=an.name;
                    newAnim.batchMode = true;
                    anims.push(newAnim);
                }

                if (sampler.interpolation === "LINEAR") {}
                else if (sampler.interpolation === "STEP") for (let k = 0; k < numComps; k++) anims[k].defaultEasing = CABLES.EASING_ABSOLUTE;
                else if (sampler.interpolation === "CUBICSPLINE") for (let k = 0; k < numComps; k++) anims[k].defaultEasing = CABLES.EASING_CUBICSPLINE;
                else op.warn("unknown interpolation", sampler.interpolation);

                // console.log(bufferOut)

                // if there is no keyframe for time 0 copy value of first keyframe at time 0
                if (bufferIn[0] !== 0.0)
                    for (let k = 0; k < numComps; k++)
                        anims[k].setValue(0, bufferOut[0 * numComps + k]);

                for (let j = 0; j < bufferIn.length; j++)
                {
                    // maxTime = Math.max(bufferIn[j], maxTime);
                    maxTimeDict[an.name] = bufferIn[j];

                    for (let k = 0; k < numComps; k++)
                    {
                        if (anims[k].defaultEasing === CABLES.EASING_CUBICSPLINE)
                        {
                            const idx = ((j * numComps) * 3 + k);

                            const key = anims[k].setValue(bufferIn[j], bufferOut[idx + numComps]);
                            key.bezTangIn = bufferOut[idx];
                            key.bezTangOut = bufferOut[idx + (numComps * 2)];

                            // console.log(an.name,k,bufferOut[idx+1]);
                        }
                        else
                        {
                            anims[k].setValue(bufferIn[j], bufferOut[j * numComps + k]);
                        }
                    }
                }
                for (let k = 0; k < numComps; k++)anims[k].batchMode = false;

                node.setAnim(chan.target.path, an.name, anims);
            }
            else
            {
                op.warn("loadAmins bufferIn undefined ", bufferIn === undefined);
                op.warn("loadAmins bufferOut undefined ", bufferOut === undefined);
                op.warn("loadAmins ", an.name, sampler, accOut);
                op.warn("loadAmins num accBuffers", gltf.accBuffers.length);
                op.warn("loadAmins num accessors", gltf.json.accessors.length);
            }
        }
    }

    gltf.uniqueAnimNames = uniqueAnimNames;

    outAnims.setRef(Object.keys(uniqueAnimNames));
}

function loadCams(gltf)
{
    if (!gltf || !gltf.json.cameras) return;

    gltf.cameras = gltf.cameras || [];

    for (let i = 0; i < gltf.nodes.length; i++)
    {
        if (gltf.nodes[i].hasOwnProperty("camera"))
        {
            const cam = new gltfCamera(gltf, gltf.nodes[i]);
            gltf.cameras.push(cam);
        }
    }
}

function loadAfterDraco()
{
    if (!window.DracoDecoder)
    {
        setTimeout(() =>
        {
            loadAfterDraco();
        }, 100);
    }

    reloadSoon();
}

function parseGltf(arrayBuffer)
{
    const CHUNK_HEADER_SIZE = 8;

    let j = 0, i = 0;

    const gltf = new Gltf();
    gltf.timing.push(["Start parsing", Math.round((performance.now() - gltf.startTime))]);

    if (!arrayBuffer) return;
    const byteArray = new Uint8Array(arrayBuffer);
    let pos = 0;

    // var string = new TextDecoder("utf-8").decode(byteArray.subarray(pos, 4));
    const string = Utf8ArrayToStr(byteArray.subarray(pos, 4));
    pos += 4;
    if (string != "glTF") return;

    gltf.timing.push(["dataview", Math.round((performance.now() - gltf.startTime))]);

    const dv = new DataView(arrayBuffer);
    const version = dv.getUint32(pos, le);
    pos += 4;
    const size = dv.getUint32(pos, le);
    pos += 4;

    outVersion.set(version);

    const chunks = [];
    gltf.chunks = chunks;

    chunks.push(readChunk(dv, byteArray, arrayBuffer, pos));
    pos += chunks[0].size + CHUNK_HEADER_SIZE;
    gltf.json = chunks[0].data;

    gltf.cables = {
        "fileUrl": inFile.get(),
        "shortFileName": CABLES.basename(inFile.get())
    };

    outJson.setRef(gltf.json);
    outExtensions.setRef(gltf.json.extensionsUsed || []);

    let ch = readChunk(dv, byteArray, arrayBuffer, pos);
    while (ch)
    {
        chunks.push(ch);
        pos += ch.size + CHUNK_HEADER_SIZE;
        ch = readChunk(dv, byteArray, arrayBuffer, pos);
    }

    gltf.chunks = chunks;

    const views = chunks[0].data.bufferViews;
    const accessors = chunks[0].data.accessors;

    gltf.timing.push(["Parse buffers", Math.round((performance.now() - gltf.startTime))]);

    if (gltf.json.extensionsUsed && gltf.json.extensionsUsed.indexOf("KHR_draco_mesh_compression") > -1)
    {
        if (!window.DracoDecoder)
        {
            op.setUiError("gltfdraco", "GLTF draco compression lib not found / add draco op to your patch!");

            loadAfterDraco();
            return gltf;
        }
        else
        {
            gltf.useDraco = true;
        }
    }

    op.setUiError("gltfdraco", null);
    // let accPos = (view.byteOffset || 0) + (acc.byteOffset || 0);

    if (views)
    {
        for (i = 0; i < accessors.length; i++)
        {
            const acc = accessors[i];
            const view = views[acc.bufferView];

            let numComps = 0;
            if (acc.type == "SCALAR")numComps = 1;
            else if (acc.type == "VEC2")numComps = 2;
            else if (acc.type == "VEC3")numComps = 3;
            else if (acc.type == "VEC4")numComps = 4;
            else if (acc.type == "MAT4")numComps = 16;
            else console.error("unknown accessor type", acc.type);

            //   const decoder = new decoderModule.Decoder();
            //   const decodedGeometry = decodeDracoData(data, decoder);
            //   // Encode mesh
            //   encodeMeshToFile(decodedGeometry, decoder);

            //   decoderModule.destroy(decoder);
            //   decoderModule.destroy(decodedGeometry);

            // 5120 (BYTE)	1
            // 5121 (UNSIGNED_BYTE)	1
            // 5122 (SHORT)	2

            if (chunks[1].dataView)
            {
                if (view)
                {
                    const num = acc.count * numComps;
                    let accPos = (view.byteOffset || 0) + (acc.byteOffset || 0);
                    let stride = view.byteStride || 0;
                    let dataBuff = null;

                    if (acc.componentType == 5126 || acc.componentType == 5125) // 4byte FLOAT or INT
                    {
                        stride = stride || 4;

                        const isInt = acc.componentType == 5125;
                        if (isInt)dataBuff = new Uint32Array(num);
                        else dataBuff = new Float32Array(num);

                        dataBuff.cblStride = numComps;

                        for (j = 0; j < num; j++)
                        {
                            if (isInt) dataBuff[j] = chunks[1].dataView.getUint32(accPos, le);
                            else dataBuff[j] = chunks[1].dataView.getFloat32(accPos, le);

                            if (stride != 4 && (j + 1) % numComps === 0)accPos += stride - (numComps * 4);
                            accPos += 4;
                        }
                    }
                    else if (acc.componentType == 5123) // UNSIGNED_SHORT
                    {
                        stride = stride || 2;

                        dataBuff = new Uint16Array(num);
                        dataBuff.cblStride = stride;

                        for (j = 0; j < num; j++)
                        {
                            dataBuff[j] = chunks[1].dataView.getUint16(accPos, le);

                            if (stride != 2 && (j + 1) % numComps === 0) accPos += stride - (numComps * 2);

                            accPos += 2;
                        }
                    }
                    else if (acc.componentType == 5121 || acc.componentType == 5120) // UNSIGNED_BYTE
                    {
                        stride = stride || 1;

                        if (acc.componentType == 5121) dataBuff = new Uint8Array(num);
                        else dataBuff = new Int8Array(num);

                        dataBuff.cblStride = stride;

                        for (j = 0; j < num; j++)
                        {
                            if (acc.componentType == 5121)
                                dataBuff[j] = chunks[1].dataView.getUint8(accPos, le);
                            else
                                dataBuff[j] = chunks[1].dataView.getInt8(accPos, le);

                            if (stride != 1 && (j + 1) % numComps === 0) accPos += stride - (numComps * 1);

                            accPos += 1;
                        }
                    }
                    else if (acc.componentType == 5120) // SIGNED_BYTE
                    {
                        stride = stride || 1;

                        dataBuff = new Int8Array(num);
                        dataBuff.cblStride = stride;

                        for (j = 0; j < num; j++)
                        {
                            dataBuff[j] = chunks[1].dataView.getUint8(accPos, le);

                            if (stride != 1 && (j + 1) % numComps === 0) accPos += stride - (numComps * 1);

                            accPos += 1;
                        }
                    }
                    else
                    {
                        console.error("unknown component type", acc.componentType);
                    }

                    gltf.accBuffers.push(dataBuff);
                }
                else
                {
                    // console.log("has no dataview");
                }
            }
        }
    }

    gltf.timing.push(["Parse mesh groups", Math.round((performance.now() - gltf.startTime))]);

    gltf.json.meshes = gltf.json.meshes || [];

    if (gltf.json.meshes)
    {
        for (i = 0; i < gltf.json.meshes.length; i++)
        {
            const mesh = new gltfMeshGroup(gltf, gltf.json.meshes[i], i);
            gltf.meshes.push(mesh);
        }
    }

    gltf.timing.push(["Parse nodes", Math.round((performance.now() - gltf.startTime))]);

    for (i = 0; i < gltf.json.nodes.length; i++)
    {
        if (gltf.json.nodes[i].children)
            for (j = 0; j < gltf.json.nodes[i].children.length; j++)
            {
                gltf.json.nodes[gltf.json.nodes[i].children[j]].isChild = true;
            }
    }

    for (i = 0; i < gltf.json.nodes.length; i++)
    {
        const node = new gltfNode(gltf.json.nodes[i], gltf);
        gltf.nodes.push(node);
    }

    for (i = 0; i < gltf.nodes.length; i++)
    {
        const node = gltf.nodes[i];

        if (!node.children) continue;
        for (let j = 0; j < node.children.length; j++)
        {
            gltf.nodes[node.children[j]].parent = node;
        }
    }

    for (i = 0; i < gltf.nodes.length; i++)
    {
        gltf.nodes[i].initSkin();
    }

    needsMatUpdate = true;

    gltf.timing.push(["load anims", Math.round((performance.now() - gltf.startTime))]);

    if (gltf.json.animations) loadAnims(gltf);

    gltf.timing.push(["load cameras", Math.round((performance.now() - gltf.startTime))]);

    if (gltf.json.cameras) loadCams(gltf);

    gltf.timing.push(["finished", Math.round((performance.now() - gltf.startTime))]);
    return gltf;
}
let gltfMesh = class
{
    constructor(name, prim, gltf, finished)
    {
        this.POINTS = 0;
        this.LINES = 1;
        this.LINE_LOOP = 2;
        this.LINE_STRIP = 3;
        this.TRIANGLES = 4;
        this.TRIANGLE_STRIP = 5;
        this.TRIANGLE_FAN = 6;

        this.test = 0;
        this.name = name;
        this.submeshIndex = 0;
        this.material = prim.material;
        this.mesh = null;
        this.geom = new CGL.Geometry("gltf_" + this.name);
        this.geom.verticesIndices = [];
        this.bounds = null;
        this.primitive = 4;
        this.morphTargetsRenderMod = null;
        this.weights = prim.weights;

        if (prim.hasOwnProperty("mode")) this.primitive = prim.mode;

        if (prim.hasOwnProperty("indices")) this.geom.verticesIndices = gltf.accBuffers[prim.indices];

        gltf.loadingMeshes = gltf.loadingMeshes || 0;
        gltf.loadingMeshes++;

        this.materialJson =
            this._matPbrMetalness =
            this._matPbrRoughness =
            this._matDiffuseColor = null;

        if (gltf.json.materials)
        {
            if (this.material != -1) this.materialJson = gltf.json.materials[this.material];

            if (this.materialJson && this.materialJson.pbrMetallicRoughness)
            {
                if (!this.materialJson.pbrMetallicRoughness.hasOwnProperty("baseColorFactor")) this._matDiffuseColor = [1, 1, 1, 1];
                else this._matDiffuseColor = this.materialJson.pbrMetallicRoughness.baseColorFactor;

                this._matDiffuseColor = this.materialJson.pbrMetallicRoughness.baseColorFactor;

                if (!this.materialJson.pbrMetallicRoughness.hasOwnProperty("metallicFactor")) this._matPbrMetalness = 1.0;
                else this._matPbrMetalness = this.materialJson.pbrMetallicRoughness.metallicFactor || null;

                if (!this.materialJson.pbrMetallicRoughness.hasOwnProperty("roughnessFactor")) this._matPbrRoughness = 1.0;
                else this._matPbrRoughness = this.materialJson.pbrMetallicRoughness.roughnessFactor || null;
            }
        }

        if (gltf.useDraco && prim.extensions.KHR_draco_mesh_compression)
        {
            const view = gltf.chunks[0].data.bufferViews[prim.extensions.KHR_draco_mesh_compression.bufferView];
            const num = view.byteLength;
            const dataBuff = new Int8Array(num);
            let accPos = (view.byteOffset || 0);// + (acc.byteOffset || 0);
            for (let j = 0; j < num; j++)
            {
                dataBuff[j] = gltf.chunks[1].dataView.getInt8(accPos, le);
                accPos++;
            }

            const dracoDecoder = window.DracoDecoder;
            dracoDecoder.decodeGeometry(dataBuff.buffer, (geometry) =>
            {
                const geom = new CGL.Geometry("draco mesh " + name);

                for (let i = 0; i < geometry.attributes.length; i++)
                {
                    const attr = geometry.attributes[i];

                    if (attr.name === "position") geom.vertices = attr.array;
                    else if (attr.name === "normal") geom.vertexNormals = attr.array;
                    else if (attr.name === "uv") geom.texCoords = attr.array;
                    else if (attr.name === "color") geom.vertexColors = this.calcVertexColors(attr.array);
                    else if (attr.name === "joints") geom.setAttribute("attrJoints", Array.from(attr.array), 4);
                    else if (attr.name === "weights")
                    {
                        const arr4 = new Float32Array(attr.array.length / attr.itemSize * 4);

                        for (let k = 0; k < attr.array.length / attr.itemSize; k++)
                        {
                            arr4[k * 4] = arr4[k * 4 + 1] = arr4[k * 4 + 2] = arr4[k * 4 + 3] = 0;
                            for (let j = 0; j < attr.itemSize; j++)
                                arr4[k * 4 + j] = attr.array[k * attr.itemSize + j];
                        }
                        geom.setAttribute("attrWeights", arr4, 4);
                    }
                    else op.logWarn("unknown draco attrib", attr);
                }

                geometry.attributes = null;
                geom.verticesIndices = geometry.index.array;

                this.setGeom(geom);

                this.mesh = null;
                gltf.loadingMeshes--;
                gltf.timing.push(["draco decode", Math.round((performance.now() - gltf.startTime))]);

                if (finished)finished(this);
            }, (error) => { op.logError(error); });
        }
        else
        {
            gltf.loadingMeshes--;
            this.fillGeomAttribs(gltf, this.geom, prim.attributes);

            if (prim.targets)
            {
                for (let j = 0; j < prim.targets.length; j++)
                {
                    const tgeom = new CGL.Geometry("gltf_target_" + j);

                    // if (prim.hasOwnProperty("indices")) tgeom.verticesIndices = gltf.accBuffers[prim.indices];

                    this.fillGeomAttribs(gltf, tgeom, prim.targets[j], false);

                    // { // calculate normals for final position of morphtarget for later...
                    //     for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] += this.geom.vertices[i];
                    //     tgeom.calculateNormals();
                    //     for (let i = 0; i < tgeom.vertices.length; i++) tgeom.vertices[i] -= this.geom.vertices[i];
                    // }

                    this.geom.morphTargets.push(tgeom);
                }
            }
            if (finished)finished(this);
        }
    }

    _linearToSrgb(x)
    {
        if (x <= 0)
            return 0;
        else if (x >= 1)
            return 1;
        else if (x < 0.0031308)
            return x * 12.92;
        else
            return x ** (1 / 2.2) * 1.055 - 0.055;
    }

    calcVertexColors(arr, type)
    {
        let vertexColors = null;
        if (arr instanceof Float32Array)
        {
            let div = false;
            for (let i = 0; i < arr.length; i++)
            {
                if (arr[i] > 1)
                {
                    div = true;
                    continue;
                }
            }

            if (div)
                for (let i = 0; i < arr.length; i++) arr[i] /= 65535;

            vertexColors = arr;
        }

        else if (arr instanceof Uint16Array)
        {
            const fb = new Float32Array(arr.length);
            for (let i = 0; i < arr.length; i++) fb[i] = arr[i] / 65535;

            vertexColors = fb;
        }
        else vertexColors = arr;

        for (let i = 0; i < vertexColors.length; i++)
        {
            vertexColors[i] = this._linearToSrgb(vertexColors[i]);
        }

        if (arr.cblStride == 3)
        {
            const nc = new Float32Array(vertexColors.length / 3 * 4);
            for (let i = 0; i < vertexColors.length / 3; i++)
            {
                nc[i * 4 + 0] = vertexColors[i * 3 + 0];
                nc[i * 4 + 1] = vertexColors[i * 3 + 1];
                nc[i * 4 + 2] = vertexColors[i * 3 + 2];
                nc[i * 4 + 3] = 1;
            }
            vertexColors = nc;
        }

        return vertexColors;
    }

    fillGeomAttribs(gltf, tgeom, attribs, setGeom)
    {
        if (attribs.hasOwnProperty("POSITION")) tgeom.vertices = gltf.accBuffers[attribs.POSITION];
        if (attribs.hasOwnProperty("NORMAL")) tgeom.vertexNormals = gltf.accBuffers[attribs.NORMAL];
        if (attribs.hasOwnProperty("TANGENT")) tgeom.tangents = gltf.accBuffers[attribs.TANGENT];

        // // console.log(gltf.accBuffers[attribs.COLOR_0])
        // console.log(gltf);

        if (attribs.hasOwnProperty("COLOR_0")) tgeom.vertexColors = this.calcVertexColors(gltf.accBuffers[attribs.COLOR_0], gltf.accBuffers[attribs.COLOR_0].type || 4);
        if (attribs.hasOwnProperty("COLOR_1")) tgeom.setAttribute("attrVertColor1", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_1]), gltf.accBuffers[attribs.COLOR_1].type || 4);
        if (attribs.hasOwnProperty("COLOR_2")) tgeom.setAttribute("attrVertColor2", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_2]), gltf.accBuffers[attribs.COLOR_2].type || 4);
        if (attribs.hasOwnProperty("COLOR_3")) tgeom.setAttribute("attrVertColor3", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_3]), gltf.accBuffers[attribs.COLOR_3].type || 4);
        if (attribs.hasOwnProperty("COLOR_4")) tgeom.setAttribute("attrVertColor4", this.calcVertexColors(gltf.accBuffers[attribs.COLOR_4]), gltf.accBuffers[attribs.COLOR_4].type || 4);

        if (attribs.hasOwnProperty("TEXCOORD_0")) tgeom.texCoords = gltf.accBuffers[attribs.TEXCOORD_0];
        if (attribs.hasOwnProperty("TEXCOORD_1")) tgeom.setAttribute("attrTexCoord1", gltf.accBuffers[attribs.TEXCOORD_1], 2);
        if (attribs.hasOwnProperty("TEXCOORD_2")) tgeom.setAttribute("attrTexCoord2", gltf.accBuffers[attribs.TEXCOORD_2], 2);
        if (attribs.hasOwnProperty("TEXCOORD_3")) tgeom.setAttribute("attrTexCoord3", gltf.accBuffers[attribs.TEXCOORD_3], 2);
        if (attribs.hasOwnProperty("TEXCOORD_4")) tgeom.setAttribute("attrTexCoord4", gltf.accBuffers[attribs.TEXCOORD_4], 2);

        if (attribs.hasOwnProperty("WEIGHTS_0"))
        {
            tgeom.setAttribute("attrWeights", gltf.accBuffers[attribs.WEIGHTS_0], 4);
        }
        if (attribs.hasOwnProperty("JOINTS_0"))
        {
            if (!gltf.accBuffers[attribs.JOINTS_0])console.log("no !gltf.accBuffers[attribs.JOINTS_0]");
            tgeom.setAttribute("attrJoints", gltf.accBuffers[attribs.JOINTS_0], 4);
        }

        if (attribs.hasOwnProperty("POSITION")) gltf.accBuffersDelete.push(attribs.POSITION);
        if (attribs.hasOwnProperty("NORMAL")) gltf.accBuffersDelete.push(attribs.NORMAL);
        if (attribs.hasOwnProperty("TEXCOORD_0")) gltf.accBuffersDelete.push(attribs.TEXCOORD_0);
        if (attribs.hasOwnProperty("TANGENT")) gltf.accBuffersDelete.push(attribs.TANGENT);
        if (attribs.hasOwnProperty("COLOR_0"))gltf.accBuffersDelete.push(attribs.COLOR_0);
        if (attribs.hasOwnProperty("COLOR_0"))gltf.accBuffersDelete.push(attribs.COLOR_0);
        if (attribs.hasOwnProperty("COLOR_1"))gltf.accBuffersDelete.push(attribs.COLOR_1);
        if (attribs.hasOwnProperty("COLOR_2"))gltf.accBuffersDelete.push(attribs.COLOR_2);
        if (attribs.hasOwnProperty("COLOR_3"))gltf.accBuffersDelete.push(attribs.COLOR_3);

        if (attribs.hasOwnProperty("TEXCOORD_1")) gltf.accBuffersDelete.push(attribs.TEXCOORD_1);
        if (attribs.hasOwnProperty("TEXCOORD_2")) gltf.accBuffersDelete.push(attribs.TEXCOORD_2);
        if (attribs.hasOwnProperty("TEXCOORD_3")) gltf.accBuffersDelete.push(attribs.TEXCOORD_3);
        if (attribs.hasOwnProperty("TEXCOORD_4")) gltf.accBuffersDelete.push(attribs.TEXCOORD_4);

        if (setGeom !== false) if (tgeom && tgeom.verticesIndices) this.setGeom(tgeom);
    }

    setGeom(geom)
    {
        geom.vertexNormals = geom.vertexNormals || [];

        if (inNormFormat.get() == "X-ZY")
        {
            for (let i = 0; i < geom.vertexNormals.length; i += 3)
            {
                let t = geom.vertexNormals[i + 2];
                geom.vertexNormals[i + 2] = geom.vertexNormals[i + 1];
                geom.vertexNormals[i + 1] = -t;
            }
        }

        if (inVertFormat.get() == "XZ-Y")
        {
            for (let i = 0; i < geom.vertices.length; i += 3)
            {
                let t = geom.vertices[i + 2];
                geom.vertices[i + 2] = -geom.vertices[i + 1];
                geom.vertices[i + 1] = t;
            }
        }
        try
        {
            if (this.primitive == this.TRIANGLES)
            {
                if (inCalcNormals.get() == "Force Smooth" || inCalcNormals.get() == false) geom.calculateNormals();
                else if (!geom.vertexNormals.length && inCalcNormals.get() == "Auto") geom.calculateNormals({ "smooth": false });

                if ((!geom.biTangents || geom.biTangents.length == 0) && geom.tangents)
                {
                    const bitan = vec3.create();
                    const tan = vec3.create();

                    const tangents = geom.tangents;
                    geom.tangents = new Float32Array(tangents.length / 4 * 3);
                    geom.biTangents = new Float32Array(tangents.length / 4 * 3);

                    for (let i = 0; i < tangents.length; i += 4)
                    {
                        const idx = i / 4 * 3;

                        vec3.cross(
                            bitan,
                            [geom.vertexNormals[idx], geom.vertexNormals[idx + 1], geom.vertexNormals[idx + 2]],
                            [tangents[i], tangents[i + 1], tangents[i + 2]]
                        );

                        vec3.div(bitan, bitan, [tangents[i + 3], tangents[i + 3], tangents[i + 3]]);
                        vec3.normalize(bitan, bitan);

                        geom.biTangents[idx + 0] = bitan[0];
                        geom.biTangents[idx + 1] = bitan[1];
                        geom.biTangents[idx + 2] = bitan[2];

                        geom.tangents[idx + 0] = tangents[i + 0];
                        geom.tangents[idx + 1] = tangents[i + 1];
                        geom.tangents[idx + 2] = tangents[i + 2];
                    }
                }

                if (geom.tangents.length === 0 || inCalcNormals.get() != "Never")
                {
                // console.log("[gltf ]no tangents... calculating tangents...");
                    geom.calcTangentsBitangents();
                }
            }
            else
            {
                console.warn("GLFT unknown primitive", this.primitive);
            }
        }
        catch (e)
        {
            console.error("e", e);
        }

        this.geom = geom;

        this.bounds = geom.getBounds();
    }

    bindMaterial()
    {

    }

    render(cgl, ignoreMaterial, skinRenderer)
    {
        if (!this.mesh && this.geom && this.geom.verticesIndices)
        {
            let g = this.geom;
            if (this.geom.vertices.length / 3 > 64000 && this.geom.verticesIndices.length > 0)
            {
                g = this.geom.copy();
                g.unIndex(false, true);
            }

            let glprim;

            if (cgl.gl)
            {
                if (this.primitive == this.TRIANGLES)glprim = cgl.gl.TRIANGLES;
                else if (this.primitive == this.LINES)glprim = cgl.gl.LINES;
                else if (this.primitive == this.LINE_STRIP)glprim = cgl.gl.LINE_STRIP;
                else if (this.primitive == this.POINTS)glprim = cgl.gl.POINTS;
                else
                {
                    op.logWarn("unknown primitive type", this);
                }
            }

            this.mesh = op.patch.cg.createMesh(g, { "glPrimitive": glprim });
        }

        if (this.mesh)
        {
            // update morphTargets
            if (this.geom && this.geom.morphTargets.length && !this.morphTargetsRenderMod)
            {
                this.mesh.addVertexNumbers = true;
                this.morphTargetsRenderMod = new GltfTargetsRenderer(this);
            }

            let useMat = !ignoreMaterial && this.material != -1 && gltf.shaders[this.material];
            if (skinRenderer)useMat = false;

            if (useMat) cgl.pushShader(gltf.shaders[this.material]);

            const currentShader = cgl.getShader() || {};
            const uniDiff = currentShader.uniformColorDiffuse;

            const uniPbrMetalness = currentShader.uniformPbrMetalness;
            const uniPbrRoughness = currentShader.uniformPbrRoughness;

            // if (gltf.shaders[this.material] && !inUseMatProps.get())
            // {
            //     gltf.shaders[this.material]=null;
            // }

            if (!gltf.shaders[this.material] && inUseMatProps.get())
            {
                if (uniDiff && this._matDiffuseColor)
                {
                    this._matDiffuseColorOrig = [uniDiff.getValue()[0], uniDiff.getValue()[1], uniDiff.getValue()[2], uniDiff.getValue()[3]];
                    uniDiff.setValue(this._matDiffuseColor);
                }

                if (uniPbrMetalness)
                    if (this._matPbrMetalness != null)
                    {
                        this._matPbrMetalnessOrig = uniPbrMetalness.getValue();
                        uniPbrMetalness.setValue(this._matPbrMetalness);
                    }
                    else
                        uniPbrMetalness.setValue(0);

                if (uniPbrRoughness)
                    if (this._matPbrRoughness != null)
                    {
                        this._matPbrRoughnessOrig = uniPbrRoughness.getValue();
                        uniPbrRoughness.setValue(this._matPbrRoughness);
                    }
                    else
                    {
                        uniPbrRoughness.setValue(0);
                    }
            }

            if (this.morphTargetsRenderMod) this.morphTargetsRenderMod.renderStart(cgl, 0);
            if (this.mesh)
            {
                this.mesh.render(cgl.getShader(), ignoreMaterial);
            }
            if (this.morphTargetsRenderMod) this.morphTargetsRenderMod.renderFinish(cgl);

            if (inUseMatProps.get())
            {
                this.setMatProps(cgl);
            }

            if (useMat) cgl.popShader();
        }
        else
        {
            console.log("no mesh......");
        }
    }

    setMatProps(cgl)
    {
        const currentShader = cgl.getShader() || {};
        const uniDiff = currentShader.uniformColorDiffuse;

        const uniPbrMetalness = currentShader.uniformPbrMetalness;
        const uniPbrRoughness = currentShader.uniformPbrRoughness;

        if (uniDiff && this._matDiffuseColor) uniDiff.setValue(this._matDiffuseColorOrig);
        if (uniPbrMetalness && this._matPbrMetalnessOrig != undefined) uniPbrMetalness.setValue(this._matPbrMetalnessOrig);
        if (uniPbrRoughness && this._matPbrRoughnessOrig != undefined) uniPbrRoughness.setValue(this._matPbrRoughnessOrig);
    }
};
const gltfMeshGroup = class
{
    constructor(gltf, m, index)
    {
        this.bounds = new CABLES.CG.BoundingBox();
        this.meshes = [];

        m.name = m.name || ("unnamed mesh " + unknownCount++);

        this.name = m.name;
        const prims = m.primitives;

        for (let i = 0; i < prims.length; i++)
        {
            const mesh = new gltfMesh(this.name, prims[i], gltf, (mesh) =>
            {
                mesh.extras = m.extras;
                this.bounds.applyBoundingBox(mesh.bounds);
            });

            mesh.submeshIndex = i;
            this.meshes.push(mesh);
        }
    }

    render(cgl, ignoreMat, skinRenderer, _time, weights)
    {
        for (let i = 0; i < this.meshes.length; i++)
        {
            const useMat = gltf.shaders[this.meshes[i].material];

            if (!ignoreMat && useMat) cgl.pushShader(gltf.shaders[this.meshes[i].material]);
            if (skinRenderer)skinRenderer.renderStart(cgl, _time);
            if (weights) this.meshes[i].weights = weights;
            this.meshes[i].render(cgl, ignoreMat, skinRenderer, _time);
            if (skinRenderer)skinRenderer.renderFinish(cgl);
            if (!ignoreMat && useMat) cgl.popShader();
        }
    }
};
const gltfNode = class
{
    constructor(node, gltf)
    {
        this.isChild = node.isChild || false;
        this.name = node.name;

        if (!node.name)
            if (node.hasOwnProperty("mesh"))
            {
                this.name = "unnamed";
            }
            else
            {
                this.name = "unnamed node " + CABLES.simpleId();
            }

        if (node.hasOwnProperty("camera")) this.camera = node.camera;
        this.hidden = false;
        this.mat = mat4.create();
        this._animActions = {};
        this.animWeights = [];
        this._animMat = mat4.create();
        this._tempMat = mat4.create();
        this._tempQuat = quat.create();
        this._tempRotmat = mat4.create();
        this.mesh = null;
        this.children = [];
        this._node = node;
        this._gltf = gltf;
        this.absMat = mat4.create();
        this.addTranslate = null;
        this._tempAnimScale = null;
        this.addMulMat = null;
        this.updateMatrix();
        this.skinRenderer = null;
        this.copies = [];
    }

    get skin()
    {
        if (this._node.hasOwnProperty("skin")) return this._node.skin;
        else return -1;
    }

    copy()
    {
        this.isCopy = true;
        const n = new gltfNode(this._node, this._gltf);
        n.copyOf = this;

        n._animActions = this._animActions;
        n.children = this.children;
        if (this.skin) n.skinRenderer = new GltfSkin(this);

        this.updateMatrix();
        return n;
    }

    hasSkin()
    {
        if (this._node.hasOwnProperty("skin")) return this._gltf.json.skins[this._node.skin].name || "unknown";
        return false;
    }

    initSkin()
    {
        if (this.skin > -1)
        {
            this.skinRenderer = new GltfSkin(this);
        }
    }

    updateMatrix()
    {
        mat4.identity(this.mat);
        if (this._node.translation) mat4.translate(this.mat, this.mat, this._node.translation);

        if (this._node.rotation)
        {
            const rotmat = mat4.create();
            this._rot = this._node.rotation;

            mat4.fromQuat(rotmat, this._node.rotation);
            mat4.mul(this.mat, this.mat, rotmat);
        }

        if (this._node.scale)
        {
            this._scale = this._node.scale;
            mat4.scale(this.mat, this.mat, this._scale);
        }

        if (this._node.hasOwnProperty("mesh"))
        {
            this.mesh = this._gltf.meshes[this._node.mesh];
        }

        if (this._node.children)
        {
            for (let i = 0; i < this._node.children.length; i++)
            {
                this._gltf.json.nodes[i].isChild = true;
                if (this._gltf.nodes[this._node.children[i]]) this._gltf.nodes[this._node.children[i]].isChild = true;
                this.children.push(this._node.children[i]);
            }
        }
    }

    unHide()
    {
        this.hidden = false;
        for (let i = 0; i < this.children.length; i++)
            if (this.children[i].unHide) this.children[i].unHide();
    }

    calcBounds(gltf, mat, bounds)
    {
        const localMat = mat4.create();

        if (mat) mat4.copy(localMat, mat);
        if (this.mat) mat4.mul(localMat, localMat, this.mat);

        if (this.mesh)
        {
            const bb = this.mesh.bounds.copy();
            bb.mulMat4(localMat);
            bounds.applyBoundingBox(bb);

            if (bounds.changed)
            {
                boundingPoints.push(
                    bb._min[0] || 0, bb._min[1] || 0, bb._min[2] || 0, bb._max[0] || 0, bb._max[1] || 0, bb._max[2] || 0);
            }
        }

        for (let i = 0; i < this.children.length; i++)
        {
            if (gltf.nodes[this.children[i]] && gltf.nodes[this.children[i]].calcBounds)
            {
                const b = gltf.nodes[this.children[i]].calcBounds(gltf, localMat, bounds);

                bounds.applyBoundingBox(b);
            }
        }

        if (bounds.changed) return bounds;
        else return null;
    }

    setAnimAction(name)
    {
        if (!name) return;

        this._currentAnimaction = name;

        if (name && !this._animActions[name]) return null;

        for (let path in this._animActions[name])
        {
            if (path == "translation") this._animTrans = this._animActions[name][path];
            else if (path == "rotation") this._animRot = this._animActions[name][path];
            else if (path == "scale") this._animScale = this._animActions[name][path];
            else if (path == "weights") this.animWeights = this._animActions[name][path];
        }
    }

    setAnim(path, name, anims)
    {
        if (!path || !name || !anims) return;

        this._animActions[name] = this._animActions[name] || {};

        // debugger;

        // for (let i = 0; i < this.copies.length; i++) this.copies[i]._animActions = this._animActions;

        if (this._animActions[name][path]) op.log("[gltfNode] animation action path already exists", name, path, this._animActions[name][path]);

        this._animActions[name][path] = anims;

        if (path == "translation") this._animTrans = anims;
        else if (path == "rotation") this._animRot = anims;
        else if (path == "scale") this._animScale = anims;
        else if (path == "weights") this.animWeights = this._animActions[name][path];
    }

    modelMatLocal()
    {
        return this._animMat || this.mat;
    }

    modelMatAbs()
    {
        return this.absMat;
    }

    transform(cgl, _time)
    {
        if (!_time && _time != 0)_time = time;

        this._lastTimeTrans = _time;

        gltfTransforms++;

        if (!this._animTrans && !this._animRot && !this._animScale)
        {
            mat4.mul(cgl.mMatrix, cgl.mMatrix, this.mat);
            this._animMat = null;
        }
        else
        {
            this._animMat = this._animMat || mat4.create();
            mat4.identity(this._animMat);

            const playAnims = true;

            if (playAnims && this._animTrans)
            {
                mat4.translate(this._animMat, this._animMat, [
                    this._animTrans[0].getValue(_time),
                    this._animTrans[1].getValue(_time),
                    this._animTrans[2].getValue(_time)]);
            }
            else
            if (this._node.translation) mat4.translate(this._animMat, this._animMat, this._node.translation);

            if (playAnims && this._animRot)
            {
                if (this._animRot[0].defaultEasing == CABLES.EASING_LINEAR) CABLES.Anim.slerpQuaternion(_time, this._tempQuat, this._animRot[0], this._animRot[1], this._animRot[2], this._animRot[3]);
                else if (this._animRot[0].defaultEasing == CABLES.EASING_ABSOLUTE)
                {
                    this._tempQuat[0] = this._animRot[0].getValue(_time);
                    this._tempQuat[1] = this._animRot[1].getValue(_time);
                    this._tempQuat[2] = this._animRot[2].getValue(_time);
                    this._tempQuat[3] = this._animRot[3].getValue(_time);
                }
                else if (this._animRot[0].defaultEasing == CABLES.EASING_CUBICSPLINE)
                {
                    CABLES.Anim.slerpQuaternion(_time, this._tempQuat, this._animRot[0], this._animRot[1], this._animRot[2], this._animRot[3]);
                }

                mat4.fromQuat(this._tempMat, this._tempQuat);
                mat4.mul(this._animMat, this._animMat, this._tempMat);
            }
            else if (this._rot)
            {
                mat4.fromQuat(this._tempRotmat, this._rot);
                mat4.mul(this._animMat, this._animMat, this._tempRotmat);
            }

            if (playAnims && this._animScale)
            {
                if (!this._tempAnimScale) this._tempAnimScale = [1, 1, 1];
                this._tempAnimScale[0] = this._animScale[0].getValue(_time);
                this._tempAnimScale[1] = this._animScale[1].getValue(_time);
                this._tempAnimScale[2] = this._animScale[2].getValue(_time);
                mat4.scale(this._animMat, this._animMat, this._tempAnimScale);
            }
            else if (this._scale) mat4.scale(this._animMat, this._animMat, this._scale);

            mat4.mul(cgl.mMatrix, cgl.mMatrix, this._animMat);
        }

        if (this.animWeights)
        {
            this.weights = this.weights || [];

            let str = "";
            for (let i = 0; i < this.animWeights.length; i++)
            {
                this.weights[i] = this.animWeights[i].getValue(_time);
                str += this.weights[i] + "/";
            }

            // this.mesh.weights=this.animWeights.get(_time);
        }

        if (this.addTranslate) mat4.translate(cgl.mMatrix, cgl.mMatrix, this.addTranslate);

        if (this.addMulMat) mat4.mul(cgl.mMatrix, cgl.mMatrix, this.addMulMat);

        mat4.copy(this.absMat, cgl.mMatrix);
    }

    render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time)
    {
        if (!dontTransform) cgl.pushModelMatrix();

        if (_time === undefined) _time = gltf.time;

        if (!dontTransform || this.skinRenderer) this.transform(cgl, _time);

        if (this.hidden && !drawHidden)
        {
        }
        else
        {
            if (this.skinRenderer)
            {
                this.skinRenderer.time = _time;
                if (!dontDrawMesh)
                    this.mesh.render(cgl, ignoreMaterial, this.skinRenderer, _time, this.weights);
            }
            else
            {
                if (this.mesh && !dontDrawMesh)
                    this.mesh.render(cgl, ignoreMaterial, null, _time, this.weights);
            }
        }

        if (!ignoreChilds && !this.hidden)
            for (let i = 0; i < this.children.length; i++)
                if (gltf.nodes[this.children[i]])
                    gltf.nodes[this.children[i]].render(cgl, dontTransform, dontDrawMesh, ignoreMaterial, ignoreChilds, drawHidden, _time);

        if (!dontTransform)cgl.popModelMatrix();
    }
};
let tab = null;
let maxChilds = 100;

function closeTab()
{
    if (tab)gui.mainTabs.closeTab(tab.id);
    tab = null;
}

function formatVec(arr)
{
    const nums = [];
    for (let i = 0; i < arr.length; i++)
    {
        nums.push(Math.round(arr[i] * 1000) / 1000);
    }

    return nums.join(",");
}

op.toggleShowAll = () =>
{
    if (maxChilds == 100)maxChilds = 9999999;
    else maxChilds = 100;
    closeTab();
    printInfo();
    console.log("maxChilds", maxChilds);
};

function printNode(html, node, level)
{
    if (!gltf) return;

    html += "<tr class=\"row\">";

    let ident = "";
    let identSpace = "";

    for (let i = 1; i < level; i++)
    {
        identSpace += "&nbsp;&nbsp;&nbsp;";
        let identClass = "identBg";
        if (i == 1)identClass = "identBgLevel0";
        ident += "<td class=\"ident " + identClass + "\" ><div style=\"\"></div></td>";
    }
    let id = CABLES.uuid();
    html += ident;
    html += "<td colspan=\"" + (21 - level) + "\">";

    if (node.mesh && node.mesh.meshes.length)html += "<span class=\"icon icon-cube\"></span>&nbsp;";
    else html += "<span class=\"icon icon-box-select\"></span> &nbsp;";

    html += node.name + "</td><td></td>";

    if (node.mesh)
    {
        html += "<td>";
        for (let i = 0; i < node.mesh.meshes.length; i++)
        {
            if (i > 0)html += ", ";
            html += node.mesh.meshes[i].name || "";
        }

        html += "</td>";

        html += "<td>";
        html += node.hasSkin() || "-";
        html += "</td>";

        html += "<td>";
        let countMats = 0;
        for (let i = 0; i < node.mesh.meshes.length; i++)
        {
            if (countMats > 0)html += ", ";
            if (gltf.json.materials && node.mesh.meshes[i].hasOwnProperty("material"))
            {
                if (gltf.json.materials[node.mesh.meshes[i].material])
                {
                    html += gltf.json.materials[node.mesh.meshes[i].material].name || "";
                    countMats++;
                }
            }
        }
        if (countMats == 0)html += "none";
        html += "</td>";
    }
    else
    {
        html += "<td>-</td><td>-</td><td>-</td>";
    }

    html += "<td>";

    if (node._node.translation || node._node.rotation || node._node.scale)
    {
        let info = "";

        if (node._node.translation)info += "Translate: `" + formatVec(node._node.translation) + "` || ";
        if (node._node.rotation)info += "Rotation: `" + formatVec(node._node.rotation) + "` || ";
        if (node._node.scale)info += "Scale: `" + formatVec(node._node.scale) + "` || ";

        html += "<span class=\"icon icon-gizmo info\" data-info=\"" + info + "\"></span> &nbsp;";
    }

    if (node._animRot || node._animScale || node._animTrans)
    {
        let info = "Animated: ";
        if (node._animRot) info += "Rot ";
        if (node._animScale) info += "Scale ";
        if (node._animTrans) info += "Trans ";

        html += "<span class=\"icon icon-clock info\" data-info=\"" + info + "\"></span>&nbsp;";
    }

    if (!node._node.translation && !node._node.rotation && !node._node.scale && !node._animRot && !node._animScale && !node._animTrans) html += "-";

    html += "</td>";

    html += "<td>";
    let hideclass = "";
    if (node.hidden)hideclass = "node-hidden";

    html += "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "','transform')\" class=\"treebutton\">Transform</a>";
    html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "','hierarchy')\" class=\"treebutton\">Hierarchy</a>";
    html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "')\" class=\"treebutton\">Node</a>";

    if (node.hasSkin())
        html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "',false,{skin:true});\" class=\"treebutton\">Skin</a>";

    html += "</td><td>";
    html += "&nbsp;<span class=\"icon iconhover icon-eye " + hideclass + "\" onclick=\"gui.corePatch().getOpById('" + op.id + "').toggleNodeVisibility('" + node.name + "');this.classList.toggle('node-hidden');\"></span>";
    html += "</td>";

    html += "</tr>";

    for (let i = 0; i < Math.min(maxChilds, node.children.length); i++)
        html = printNode(html, gltf.nodes[node.children[i]], level + 1);

    if (node.children.length > maxChilds)
        html += "<tr ><td></td><td colspan=\"14\"><br/><br/><a onclick=\"gui.corePatch().getOpById('" + op.id + "').toggleShowAll()\" class=\"button-small\">...and many more</a><br/><br/><br/></td></tr>";

    return html;
}

function printMaterial(mat, idx)
{
    let html = "<tr>";
    html += " <td>" + idx + "</td>";
    html += " <td>" + mat.name + "</td>";
    html += " <td>";

    const info = JSON.stringify(mat, null, 4).replaceAll("\"", "").replaceAll("\n", "<br/>");

    html += "<span class=\"icon icon-info\" onclick=\"new CABLES.UI.ModalDialog({ 'html': '<pre>" + info + "</pre>', 'title': '" + mat.name + "' });\"></span>&nbsp;";

    if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor)
    {
        let rgb = "";
        rgb += "" + Math.round(mat.pbrMetallicRoughness.baseColorFactor[0] * 255);
        rgb += "," + Math.round(mat.pbrMetallicRoughness.baseColorFactor[1] * 255);
        rgb += "," + Math.round(mat.pbrMetallicRoughness.baseColorFactor[2] * 255);

        html += "<div style=\"width:15px;height:15px;background-color:rgb(" + rgb + ");display:inline-block\">&nbsp;</a>";
    }
    html += "<td style=\"\">" + (gltf.shaders[idx] ? "-" : "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').assignMaterial('" + mat.name + "')\" class=\"treebutton\">Assign</a>") + "<td>";
    html += "<td>";

    html += "</tr>";
    return html;
}

function printInfo()
{
    if (!gltf) return;

    const startTime = performance.now();
    const sizes = {};
    let html = "<div style=\"overflow:scroll;width:100%;height:100%\">";

    html += "File: <a href=\"" + CABLES.platform.getCablesUrl() + "/asset/patches/?filename=" + inFile.get() + "\" target=\"_blank\">" + CABLES.basename(inFile.get()) + "</a><br/>";

    html += "Generator: " + gltf.json.asset.generator + "<br/>";
    html += "Extensions: " + (gltf.json.extensionsUsed || []).join(",") + "<br/>";

    let numNodes = 0;
    if (gltf.json.nodes)numNodes = gltf.json.nodes.length;
    html += "<div id=\"groupNodes\">Nodes (" + numNodes + ")</div>";

    html += "<table id=\"sectionNodes\" class=\"table treetable\">";

    html += "<tr>";
    html += " <th colspan=\"21\">Name</th>";
    html += " <th>Mesh</th>";
    html += " <th>Skin</th>";
    html += " <th>Material</th>";
    html += " <th>Transform</th>";
    html += " <th>Expose</th>";
    html += " <th></th>";
    html += "</tr>";

    for (let i = 0; i < gltf.nodes.length; i++)
    {
        if (!gltf.nodes[i].isChild)
            html = printNode(html, gltf.nodes[i], 1);
    }
    html += "</table>";

    // / //////////////////

    let numMaterials = 0;
    if (gltf.json.materials)numMaterials = gltf.json.materials.length;
    html += "<div id=\"groupMaterials\">Materials (" + numMaterials + ")</div>";

    if (!gltf.json.materials || gltf.json.materials.length == 0)
    {
    }
    else
    {
        html += "<table id=\"materialtable\"  class=\"table treetable\">";
        html += "<tr>";
        html += " <th>Index</th>";
        html += " <th>Name</th>";
        html += " <th>Color</th>";
        html += " <th>Function</th>";
        html += " <th></th>";
        html += "</tr>";
        for (let i = 0; i < gltf.json.materials.length; i++)
        {
            html += printMaterial(gltf.json.materials[i], i);
        }
        html += "</table>";
    }

    // / ///////////////////////

    html += "<div id=\"groupMeshes\">Mesh Geometries (" + gltf.json.meshes.length + ")</div>";

    html += "<table id=\"meshestable\"  class=\"table treetable\">";
    html += "<tr>";
    html += " <th>Name</th>";
    html += " <th>Node</th>";
    html += " <th>Material</th>";
    html += " <th>Vertices</th>";
    html += " <th>Attributes</th>";
    html += "</tr>";

    let sizeBufferViews = [];
    sizes.meshes = 0;
    sizes.meshTargets = 0;

    for (let i = 0; i < gltf.json.meshes.length; i++)
    {
        html += "<tr>";
        html += "<td>" + gltf.json.meshes[i].name || "?" + "</td>";

        html += "<td>";
        let count = 0;
        let nodename = "";
        if (gltf.json.nodes)
            for (let j = 0; j < gltf.json.nodes.length; j++)
            {
                if (gltf.json.nodes[j].mesh == i)
                {
                    count++;
                    if (count == 1)
                    {
                        nodename = gltf.json.nodes[j].name;
                    }
                }
            }
        if (count > 1) html += (count) + " nodes (" + nodename + " ...)";
        else html += nodename || "";
        html += "</td>";

        // -------

        html += "<td>";
        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            if (gltf.json.meshes[i].primitives[j].hasOwnProperty("material"))
            {
                if (gltf.json.materials[gltf.json.meshes[i]])
                {
                    html += (gltf.json.materials[gltf.json.meshes[i].primitives[j].material].name || "-") + " ";
                }
            }
            else html += "None";
        }
        html += "</td>";

        html += "<td>";
        let numVerts = 0;
        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            if (gltf.json.meshes[i].primitives[j].attributes.POSITION != undefined)
            {
                let v = parseInt(gltf.json.accessors[gltf.json.meshes[i].primitives[j].attributes.POSITION].count);
                numVerts += v;
                html += "" + v + "<br/>";
            }
            else html += "-<br/>";
        }

        if (gltf.json.meshes[i].primitives.length > 1)
            html += "=" + numVerts;
        html += "</td>";

        html += "<td>";
        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            html += Object.keys(gltf.json.meshes[i].primitives[j].attributes);
            html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeGeom('" + gltf.json.meshes[i].name + "'," + j + ")\" class=\"treebutton\">Geometry</a>";
            html += "<br/>";

            if (gltf.json.meshes[i].primitives[j].targets)
            {
                html += gltf.json.meshes[i].primitives[j].targets.length + " targets<br/>";

                if (gltf.json.meshes[i].extras && gltf.json.meshes[i].extras.targetNames)
                    html += "Targetnames:<br/>" + gltf.json.meshes[i].extras.targetNames.join("<br/>");

                html += "<br/>";
            }
        }

        html += "</td>";
        html += "</tr>";

        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            const accessor = gltf.json.accessors[gltf.json.meshes[i].primitives[j].indices];
            if (accessor)
            {
                let bufView = accessor.bufferView;

                if (sizeBufferViews.indexOf(bufView) == -1)
                {
                    sizeBufferViews.push(bufView);
                    if (gltf.json.bufferViews[bufView])sizes.meshes += gltf.json.bufferViews[bufView].byteLength;
                }
            }

            for (let k in gltf.json.meshes[i].primitives[j].attributes)
            {
                const attr = gltf.json.meshes[i].primitives[j].attributes[k];
                const bufView2 = gltf.json.accessors[attr].bufferView;

                if (sizeBufferViews.indexOf(bufView2) == -1)
                {
                    sizeBufferViews.push(bufView2);
                    if (gltf.json.bufferViews[bufView2])sizes.meshes += gltf.json.bufferViews[bufView2].byteLength;
                }
            }

            if (gltf.json.meshes[i].primitives[j].targets)
                for (let k = 0; k < gltf.json.meshes[i].primitives[j].targets.length; k++)
                {
                    for (let l in gltf.json.meshes[i].primitives[j].targets[k])
                    {
                        const accessorIdx = gltf.json.meshes[i].primitives[j].targets[k][l];
                        const accessor = gltf.json.accessors[accessorIdx];
                        const bufView2 = accessor.bufferView;
                        console.log("accessor", accessor);
                        if (sizeBufferViews.indexOf(bufView2) == -1)
                            if (gltf.json.bufferViews[bufView2])
                            {
                                sizeBufferViews.push(bufView2);
                                sizes.meshTargets += gltf.json.bufferViews[bufView2].byteLength;
                            }
                    }
                }
        }
    }
    html += "</table>";

    // / //////////////////////////////////

    let numSamplers = 0;
    let numAnims = 0;
    let numKeyframes = 0;

    if (gltf.json.animations)
    {
        numAnims = gltf.json.animations.length;
        for (let i = 0; i < gltf.json.animations.length; i++)
        {
            numSamplers += gltf.json.animations[i].samplers.length;
        }
    }

    html += "<div id=\"groupAnims\">Animations (" + numAnims + "/" + numSamplers + ")</div>";

    if (gltf.json.animations)
    {
        html += "<table id=\"sectionAnim\" class=\"table treetable\">";
        html += "<tr>";
        html += "  <th>Name</th>";
        html += "  <th>Target node</th>";
        html += "  <th>Path</th>";
        html += "  <th>Interpolation</th>";
        html += "  <th>Keys</th>";
        html += "</tr>";

        sizes.animations = 0;

        for (let i = 0; i < gltf.json.animations.length; i++)
        {
            for (let j = 0; j < gltf.json.animations[i].samplers.length; j++)
            {
                let bufView = gltf.json.accessors[gltf.json.animations[i].samplers[j].input].bufferView;
                if (sizeBufferViews.indexOf(bufView) == -1)
                {
                    sizeBufferViews.push(bufView);
                    sizes.animations += gltf.json.bufferViews[bufView].byteLength;
                }

                bufView = gltf.json.accessors[gltf.json.animations[i].samplers[j].output].bufferView;
                if (sizeBufferViews.indexOf(bufView) == -1)
                {
                    sizeBufferViews.push(bufView);
                    sizes.animations += gltf.json.bufferViews[bufView].byteLength;
                }
            }

            for (let j = 0; j < gltf.json.animations[i].channels.length; j++)
            {
                html += "<tr>";
                html += "  <td> Anim " + i + ": " + gltf.json.animations[i].name + "</td>";

                html += "  <td>" + gltf.nodes[gltf.json.animations[i].channels[j].target.node].name + "</td>";
                html += "  <td>";
                html += gltf.json.animations[i].channels[j].target.path + " ";
                html += "  </td>";

                const smplidx = gltf.json.animations[i].channels[j].sampler;
                const smplr = gltf.json.animations[i].samplers[smplidx];

                html += "  <td>" + smplr.interpolation + "</td>";

                html += "  <td>" + gltf.json.accessors[smplr.output].count;
                numKeyframes += gltf.json.accessors[smplr.output].count;

                // html += "&nbsp;&nbsp;<a onclick=\"gui.corePatch().getOpById('" + op.id + "').showAnim('" + i + "','" + j + "')\" class=\"icon icon-search\"></a>";

                html += "</td>";

                html += "</tr>";
            }
        }

        html += "<tr>";
        html += "  <td></td>";
        html += "  <td></td>";
        html += "  <td></td>";
        html += "  <td></td>";
        html += "  <td>" + numKeyframes + " total</td>";
        html += "</tr>";
        html += "</table>";
    }
    else
    {

    }

    // / ///////////////////

    let numImages = 0;
    if (gltf.json.images)numImages = gltf.json.images.length;
    html += "<div id=\"groupImages\">Images (" + numImages + ")</div>";

    if (gltf.json.images)
    {
        html += "<table id=\"sectionImages\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>name</th>";
        html += "  <th>type</th>";
        html += "  <th>func</th>";
        html += "</tr>";

        sizes.images = 0;

        for (let i = 0; i < gltf.json.images.length; i++)
        {
            if (gltf.json.images[i].hasOwnProperty("bufferView"))
            {
                // if (sizeBufferViews.indexOf(gltf.json.images[i].hasOwnProperty("bufferView")) == -1)console.log("image bufferview already there?!");
                // else
                sizes.images += gltf.json.bufferViews[gltf.json.images[i].bufferView].byteLength;
            }
            else console.log("image has no bufferview?!");

            html += "<tr>";
            html += "<td>" + gltf.json.images[i].name + "</td>";
            html += "<td>" + gltf.json.images[i].mimeType + "</td>";
            html += "<td>";

            let name = gltf.json.images[i].name;
            if (name === undefined)name = gltf.json.images[i].bufferView;

            html += "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeTexture('" + name + "')\" class=\"treebutton\">Expose</a>";
            html += "</td>";

            html += "<tr>";
        }
        html += "</table>";
    }

    // / ///////////////////////

    let numCameras = 0;
    if (gltf.json.cameras)numCameras = gltf.json.cameras.length;
    html += "<div id=\"groupCameras\">Cameras (" + numCameras + ")</div>";

    if (gltf.json.cameras)
    {
        html += "<table id=\"sectionCameras\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>name</th>";
        html += "  <th>type</th>";
        html += "  <th>info</th>";
        html += "</tr>";

        for (let i = 0; i < gltf.json.cameras.length; i++)
        {
            html += "<tr>";
            html += "<td>" + gltf.json.cameras[i].name + "</td>";
            html += "<td>" + gltf.json.cameras[i].type + "</td>";
            html += "<td>";

            if (gltf.json.cameras[i].perspective)
            {
                html += "yfov: " + Math.round(gltf.json.cameras[i].perspective.yfov * 100) / 100;
                html += ", ";
                html += "zfar: " + Math.round(gltf.json.cameras[i].perspective.zfar * 100) / 100;
                html += ", ";
                html += "znear: " + Math.round(gltf.json.cameras[i].perspective.znear * 100) / 100;
            }
            html += "</td>";

            html += "<tr>";
        }
        html += "</table>";
    }

    // / ////////////////////////////////////

    let numSkins = 0;
    if (gltf.json.skins)numSkins = gltf.json.skins.length;
    html += "<div id=\"groupSkins\">Skins (" + numSkins + ")</div>";

    if (gltf.json.skins)
    {
        // html += "<h3>Skins (" + gltf.json.skins.length + ")</h3>";
        html += "<table id=\"sectionSkins\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>name</th>";
        html += "  <th></th>";
        html += "  <th>total joints</th>";
        html += "</tr>";

        for (let i = 0; i < gltf.json.skins.length; i++)
        {
            html += "<tr>";
            html += "<td>" + gltf.json.skins[i].name + "</td>";
            html += "<td>" + "</td>";
            html += "<td>" + gltf.json.skins[i].joints.length + "</td>";
            html += "<td>";
            html += "</td>";
            html += "<tr>";
        }
        html += "</table>";
    }

    // / ////////////////////////////////////

    if (gltf.timing)
    {
        html += "<div id=\"groupTiming\">Debug Loading Timing </div>";

        html += "<table id=\"sectionTiming\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>task</th>";
        html += "  <th>time used</th>";
        html += "</tr>";

        let lt = 0;
        for (let i = 0; i < gltf.timing.length - 1; i++)
        {
            html += "<tr>";
            html += "  <td>" + gltf.timing[i][0] + "</td>";
            html += "  <td>" + (gltf.timing[i + 1][1] - gltf.timing[i][1]) + " ms</td>";
            html += "</tr>";
            // lt = gltf.timing[i][1];
        }
        html += "</table>";
    }

    // / //////////////////////////

    let sizeBin = 0;
    if (gltf.json.buffers)
        sizeBin = gltf.json.buffers[0].byteLength;

    html += "<div id=\"groupBinary\">File Size Allocation (" + Math.round(sizeBin / 1024) + "k )</div>";

    html += "<table id=\"sectionBinary\" class=\"table treetable\">";
    html += "<tr>";
    html += "  <th>name</th>";
    html += "  <th>size</th>";
    html += "  <th>%</th>";
    html += "</tr>";
    let sizeUnknown = sizeBin;
    for (let i in sizes)
    {
        // html+=i+':'+Math.round(sizes[i]/1024);
        html += "<tr>";
        html += "<td>" + i + "</td>";
        html += "<td>" + readableSize(sizes[i]) + " </td>";
        html += "<td>" + Math.round(sizes[i] / sizeBin * 100) + "% </td>";
        html += "<tr>";
        sizeUnknown -= sizes[i];
    }

    if (sizeUnknown != 0)
    {
        html += "<tr>";
        html += "<td>unknown</td>";
        html += "<td>" + readableSize(sizeUnknown) + " </td>";
        html += "<td>" + Math.round(sizeUnknown / sizeBin * 100) + "% </td>";
        html += "<tr>";
    }

    html += "</table>";
    html += "</div>";

    tab = new CABLES.UI.Tab("GLTF " + CABLES.basename(inFile.get()), { "icon": "cube", "infotext": "tab_gltf", "padding": true, "singleton": true });
    gui.mainTabs.addTab(tab, true);

    tab.addEventListener("close", closeTab);
    tab.html(html);

    CABLES.UI.Collapsable.setup(ele.byId("groupNodes"), ele.byId("sectionNodes"), false);
    CABLES.UI.Collapsable.setup(ele.byId("groupMaterials"), ele.byId("materialtable"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupAnims"), ele.byId("sectionAnim"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupMeshes"), ele.byId("meshestable"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupCameras"), ele.byId("sectionCameras"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupImages"), ele.byId("sectionImages"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupSkins"), ele.byId("sectionSkins"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupBinary"), ele.byId("sectionBinary"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupTiming"), ele.byId("sectionTiming"), true);

    gui.maintabPanel.show(true);
}

function readableSize(n)
{
    if (n > 1024) return Math.round(n / 1024) + " kb";
    if (n > 1024 * 500) return Math.round(n / 1024) + " mb";
    else return n + " bytes";
}
const GltfSkin = class
{
    constructor(node)
    {
        this._mod = null;
        this._node = node;
        this._lastTime = 0;
        this._matArr = [];
        this._m = mat4.create();
        this._invBindMatrix = mat4.create();
        this.identity = true;
    }

    renderFinish(cgl)
    {
        cgl.popModelMatrix();
        this._mod.unbind();
    }

    renderStart(cgl, time)
    {
        if (!this._mod)
        {
            this._mod = new CGL.ShaderModifier(cgl, op.name + this._node.name);

            this._mod.addModule({
                "priority": -2,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.skin_head_vert || "",
                "srcBodyVert": attachments.skin_vert || ""
            });

            this._mod.addUniformVert("m4[]", "MOD_boneMats", []);// bohnenmatze
            const tr = vec3.create();
        }

        const skinIdx = this._node.skin;
        const arrLength = gltf.json.skins[skinIdx].joints.length * 16;

        // if (this._lastTime != time || !time)
        {
            // this._lastTime=inTime.get();
            if (this._matArr.length != arrLength) this._matArr.length = arrLength;

            for (let i = 0; i < gltf.json.skins[skinIdx].joints.length; i++)
            {
                const i16 = i * 16;
                const jointIdx = gltf.json.skins[skinIdx].joints[i];
                const nodeJoint = gltf.nodes[jointIdx];

                for (let j = 0; j < 16; j++)
                    this._invBindMatrix[j] = gltf.accBuffers[gltf.json.skins[skinIdx].inverseBindMatrices][i16 + j];

                mat4.mul(this._m, nodeJoint.modelMatAbs(), this._invBindMatrix);

                for (let j = 0; j < this._m.length; j++) this._matArr[i16 + j] = this._m[j];
            }

            this._mod.setUniformValue("MOD_boneMats", this._matArr);
            this._lastTime = time;
        }

        this._mod.define("SKIN_NUM_BONES", gltf.json.skins[skinIdx].joints.length);
        this._mod.bind();

        // draw mesh...
        cgl.pushModelMatrix();
        if (this.identity)mat4.identity(cgl.mMatrix);
    }
};
const GltfTargetsRenderer = class
{
    constructor(mesh)
    {
        this.mesh = mesh;
        this.tex = null;
        this.numRowsPerTarget = 0;

        this.makeTex(mesh.geom);
    }

    renderFinish(cgl)
    {
        if (!cgl.gl) return;
        cgl.popModelMatrix();
        this._mod.unbind();
    }

    renderStart(cgl, time)
    {
        if (!cgl.gl) return;
        if (!this._mod)
        {
            this._mod = new CGL.ShaderModifier(cgl, "gltftarget");

            this._mod.addModule({
                "priority": -2,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": attachments.targets_head_vert || "",
                "srcBodyVert": attachments.targets_vert || ""
            });

            this._mod.addUniformVert("4f", "MOD_targetTexInfo", [0, 0, 0, 0]);
            this._mod.addUniformVert("t", "MOD_targetTex", 1);
            this._mod.addUniformVert("f[]", "MOD_weights", []);

            const tr = vec3.create();
        }

        this._mod.pushTexture("MOD_targetTex", this.tex);
        if (this.tex && this.mesh.weights)
        {
            this._mod.setUniformValue("MOD_weights", this.mesh.weights);
            this._mod.setUniformValue("MOD_targetTexInfo", [this.tex.width, this.tex.height, this.numRowsPerTarget, this.mesh.weights.length]);

            this._mod.define("MOD_NUM_WEIGHTS", Math.max(1, this.mesh.weights.length));
        }
        else
        {
            this._mod.define("MOD_NUM_WEIGHTS", 1);
        }
        this._mod.bind();

        // draw mesh...
        cgl.pushModelMatrix();
        if (this.identity)mat4.identity(cgl.mMatrix);
    }

    makeTex(geom)
    {
        if (!cgl.gl) return;

        if (!geom.morphTargets || !geom.morphTargets.length) return console.log("no morphtargets");

        let w = geom.morphTargets[0].vertices.length / 3;
        let h = 0;
        this.numRowsPerTarget = 0;

        const gl = cgl.gl;
        if (w > gl.getParameter(gl.MAX_TEXTURE_SIZE) || h > gl.getParameter(gl.MAX_TEXTURE_SIZE))
        {
            console.error("gltf morph texture size too big...");
            op.setUiError("mtt", "morphtarget texture bigger then browser max texture size " + w + ">" + gl.getParameter(gl.MAX_TEXTURE_SIZE), 1);
        }
        else
        {
            op.setUiError("mtt", null, 1);
        }

        w = Math.min(w, gl.getParameter(gl.MAX_TEXTURE_SIZE) - 1);
        h = Math.min(h, gl.getParameter(gl.MAX_TEXTURE_SIZE) - 1);

        if (geom.morphTargets[0].vertices && geom.morphTargets[0].vertices.length) this.numRowsPerTarget++;
        if (geom.morphTargets[0].vertexNormals && geom.morphTargets[0].vertexNormals.length) this.numRowsPerTarget++;
        if (geom.morphTargets[0].tangents && geom.morphTargets[0].tangents.length) this.numRowsPerTarget++;
        if (geom.morphTargets[0].bitangents && geom.morphTargets[0].bitangents.length) this.numRowsPerTarget++;

        h = geom.morphTargets.length * this.numRowsPerTarget;

        // console.log("this.numRowsPerTarget", this.numRowsPerTarget);

        const pixels = new Float32Array(w * h * 4);
        let row = 0;

        for (let i = 0; i < geom.morphTargets.length; i++)
        {
            if (geom.morphTargets[i].vertices && geom.morphTargets[i].vertices.length)
            {
                for (let j = 0; j < geom.morphTargets[i].vertices.length; j += 3)
                {
                    pixels[((row * w) + (j / 3)) * 4 + 0] = geom.morphTargets[i].vertices[j + 0];
                    pixels[((row * w) + (j / 3)) * 4 + 1] = geom.morphTargets[i].vertices[j + 1];
                    pixels[((row * w) + (j / 3)) * 4 + 2] = geom.morphTargets[i].vertices[j + 2];
                    pixels[((row * w) + (j / 3)) * 4 + 3] = 1;
                }
                row++;
            }

            if (geom.morphTargets[i].vertexNormals && geom.morphTargets[i].vertexNormals.length)
            {
                for (let j = 0; j < geom.morphTargets[i].vertexNormals.length; j += 3)
                {
                    pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].vertexNormals[j + 0];
                    pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].vertexNormals[j + 1];
                    pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].vertexNormals[j + 2];
                    pixels[(row * w + j / 3) * 4 + 3] = 1;
                }

                row++;
            }

            if (geom.morphTargets[i].tangents && geom.morphTargets[i].tangents.length)
            {
                for (let j = 0; j < geom.morphTargets[i].tangents.length; j += 3)
                {
                    pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].tangents[j + 0];
                    pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].tangents[j + 1];
                    pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].tangents[j + 2];
                    pixels[(row * w + j / 3) * 4 + 3] = 1;
                }
                row++;
            }

            if (geom.morphTargets[i].bitangents && geom.morphTargets[i].bitangents.length)
            {
                for (let j = 0; j < geom.morphTargets[i].bitangents.length; j += 3)
                {
                    pixels[(row * w + j / 3) * 4 + 0] = geom.morphTargets[i].bitangents[j + 0];
                    pixels[(row * w + j / 3) * 4 + 1] = geom.morphTargets[i].bitangents[j + 1];
                    pixels[(row * w + j / 3) * 4 + 2] = geom.morphTargets[i].bitangents[j + 2];
                    pixels[(row * w + j / 3) * 4 + 3] = 1;
                }
                row++;
            }
        }

        this.tex = new CGL.Texture(cgl, { "isFloatingPointTexture": true, "name": "targetsTexture" });

        this.tex.initFromData(pixels, w, h, CGL.Texture.FILTER_LINEAR, CGL.Texture.WRAP_REPEAT);

        // console.log("morphTargets generated texture", w, h);
    }
};
// https://raw.githubusercontent.com/KhronosGroup/glTF/master/specification/2.0/figures/gltfOverview-2.0.0b.png

const
    inExec = op.inTrigger("Render"),
    dataPort = op.inString("data"),
    inFile = op.inUrl("glb File", [".glb"]),
    inRender = op.inBool("Draw", true),
    inCamera = op.inDropDown("Camera", ["None"], "None"),
    inAnimation = op.inString("Animation", ""),
    inShow = op.inTriggerButton("Show Structure"),
    inCenter = op.inSwitch("Center", ["None", "XYZ", "XZ"], "XYZ"),
    inRescale = op.inBool("Rescale", true),
    inRescaleSize = op.inFloat("Rescale Size", 2.5),

    inTime = op.inFloat("Time"),
    inTimeLine = op.inBool("Sync to timeline", false),
    inLoop = op.inBool("Loop", true),

    inNormFormat = op.inSwitch("Normals Format", ["XYZ", "X-ZY"], "XYZ"),
    inVertFormat = op.inSwitch("Vertices Format", ["XYZ", "XZ-Y"], "XYZ"),
    inCalcNormals = op.inSwitch("Calc Normals", ["Auto", "Force Smooth", "Never"], "Auto"),

    inMaterials = op.inObject("Materials"),
    inHideNodes = op.inArray("Hide Nodes"),
    inUseMatProps = op.inBool("Use Material Properties", false),

    inActive = op.inBool("Active", true),

    nextBefore = op.outTrigger("Render Before"),
    next = op.outTrigger("Next"),
    outGenerator = op.outString("Generator"),

    outVersion = op.outNumber("GLTF Version"),
    outExtensions = op.outArray("GLTF Extensions Used"),
    outAnimLength = op.outNumber("Anim Length", 0),
    outAnimTime = op.outNumber("Anim Time", 0),
    outJson = op.outObject("Json"),
    outAnims = op.outArray("Anims"),
    outPoints = op.outArray("BoundingPoints"),
    outBounds = op.outObject("Bounds"),
    outAnimFinished = op.outTrigger("Finished"),
    outLoading = op.outBool("Loading");

op.setPortGroup("Timing", [inTime, inTimeLine, inLoop]);

let cgl = op.patch.cg || op.patch.cgl;
let gltfLoadingErrorMesh = null;
let gltfLoadingError = false;
let gltfTransforms = 0;
let finishedLoading = false;
let cam = null;
let boundingPoints = [];
let gltf = null;
let maxTime = 0;
let maxTimeDict = {};
let time = 0;
let needsMatUpdate = true;
let timedLoader = null;
let loadingId = null;
let data = null;
const scale = vec3.create();
let lastTime = 0;
let unknownCount = 0;
let doCenter = false;
const boundsCenter = vec3.create();

inFile.onChange =
    inVertFormat.onChange =
    inCalcNormals.onChange =
    inNormFormat.onChange = reloadSoon;

inShow.onTriggered = printInfo;
dataPort.onChange = loadData;
inHideNodes.onChange = hideNodesFromData;
inAnimation.onChange = updateAnimation;
inCenter.onChange = updateCenter;
op.toWorkPortsNeedToBeLinked(inExec);

dataPort.setUiAttribs({ "hideParam": true, "hidePort": true });
op.setPortGroup("Transform", [inRescale, inRescaleSize, inCenter]);

function updateCamera()
{
    const arr = ["None"];
    if (gltf)
    {
        for (let i = 0; i < gltf.nodes.length; i++)
        {
            if (gltf.nodes[i].camera >= 0)
            {
                arr.push(gltf.nodes[i].name);
            }
        }
    }
    inCamera.uiAttribs.values = arr;
}

function updateCenter()
{
    doCenter = inCenter.get() != "None";

    if (gltf && gltf.bounds)
    {
        boundsCenter.set(gltf.bounds.center);
        boundsCenter[0] = -boundsCenter[0];
        boundsCenter[1] = -boundsCenter[1];
        boundsCenter[2] = -boundsCenter[2];
        if (inCenter.get() == "XZ") boundsCenter[1] = -gltf.bounds.minY;
    }
}

inRescale.onChange = function ()
{
    inRescaleSize.setUiAttribs({ "greyout": !inRescale.get() });
};

inMaterials.onChange = function ()
{
    needsMatUpdate = true;
};

op.onDelete = function ()
{
    closeTab();
};

inTimeLine.onChange = function ()
{
    inTime.setUiAttribs({ "greyout": inTimeLine.get() });
};

inCamera.onChange = setCam;

function setCam()
{
    cam = null;
    if (!gltf) return;

    for (let i = 0; i < gltf.nodes.length; i++)
    {
        if (gltf.nodes[i].name == inCamera.get())cam = new gltfCamera(gltf, gltf.nodes[i]);
    }
}

inExec.onTriggered = function ()
{
    cgl = op.patch.cg || op.patch.cgl;

    if (!finishedLoading) return;
    if (!inActive.get()) return;

    if (gltfLoadingError)
    {
        if (!gltfLoadingErrorMesh) gltfLoadingErrorMesh = CGL.MESHES.getSimpleCube(cgl, "ErrorCube");
        gltfLoadingErrorMesh.render(cgl.getShader());
    }

    gltfTransforms = 0;
    if (inTimeLine.get()) time = op.patch.timer.getTime();
    else time = Math.max(0, inTime.get());

    if (inLoop.get())
    {
        time %= maxTime;
        if (time < lastTime) outAnimFinished.trigger();
    }
    else
    {
        if (maxTime > 0 && time >= maxTime) outAnimFinished.trigger();
    }

    lastTime = time;

    cgl.pushModelMatrix();

    outAnimTime.set(time || 0);

    if (finishedLoading && gltf && gltf.bounds)
    {
        if (inRescale.get())
        {
            let sc = inRescaleSize.get() / gltf.bounds.maxAxis;
            gltf.scale = sc;
            vec3.set(scale, sc, sc, sc);
            mat4.scale(cgl.mMatrix, cgl.mMatrix, scale);
        }
        if (doCenter)
        {
            mat4.translate(cgl.mMatrix, cgl.mMatrix, boundsCenter);
        }
    }

    let oldScene = cgl.tempData.currentScene || null;
    cgl.tempData.currentScene = gltf;

    nextBefore.trigger();

    if (finishedLoading)
    {
        if (needsMatUpdate) updateMaterials();

        if (cam) cam.start(time);

        if (gltf)
        {
            gltf.time = time;

            if (gltf.bounds && cgl.shouldDrawHelpers(op))
            {
                if (op.isCurrentUiOp()) cgl.pushShader(CABLES.GL_MARKER.getSelectedShader(cgl));
                else cgl.pushShader(CABLES.GL_MARKER.getDefaultShader(cgl));

                gltf.bounds.render(cgl, null, op);
                cgl.popShader();
            }

            if (inRender.get())
            {
                for (let i = 0; i < gltf.nodes.length; i++)
                    if (!gltf.nodes[i].isChild)
                        gltf.nodes[i].render(cgl);
            }
            else
            {
                for (let i = 0; i < gltf.nodes.length; i++)
                    if (!gltf.nodes[i].isChild)
                        gltf.nodes[i].render(cgl, false, true);
            }
        }
    }

    next.trigger();
    cgl.tempData.currentScene = oldScene;

    cgl.popModelMatrix();

    if (cam)cam.end();
};

function finishLoading()
{
    if (!gltf)
    {
        finishedLoading = true;
        gltfLoadingError = true;
        cgl.patch.loading.finished(loadingId);

        op.setUiError("nogltf", "GLTF File not found");
        return;
    }

    op.setUiError("nogltf", null);

    if (gltf.loadingMeshes > 0)
    {
        // op.log("waiting for async meshes...");
        setTimeout(finishLoading, 100);
        return;
    }

    gltf.timing.push(["finishLoading()", Math.round((performance.now() - gltf.startTime))]);

    needsMatUpdate = true;
    // op.refreshParams();
    // outAnimLength.set(maxTime);

    gltf.bounds = new CABLES.CG.BoundingBox();
    // gltf.bounds.applyPos(0, 0, 0);

    // if (!gltf)op.setUiError("urlerror", "could not load gltf:<br/>\"" + inFile.get() + "\"", 2);
    // else op.setUiError("urlerror", null);

    gltf.timing.push(["start calc bounds", Math.round((performance.now() - gltf.startTime))]);

    for (let i = 0; i < gltf.nodes.length; i++)
    {
        const node = gltf.nodes[i];
        node.updateMatrix();
        if (!node.isChild) node.calcBounds(gltf, null, gltf.bounds);
    }

    if (gltf.bounds)outBounds.setRef(gltf.bounds);

    gltf.timing.push(["calced bounds", Math.round((performance.now() - gltf.startTime))]);

    hideNodesFromData();

    gltf.timing.push(["hideNodesFromData", Math.round((performance.now() - gltf.startTime))]);

    if (tab)printInfo();

    gltf.timing.push(["printinfo", Math.round((performance.now() - gltf.startTime))]);

    updateCamera();
    setCam();
    outPoints.set(boundingPoints);

    if (gltf)
    {
        if (inFile.get() && !inFile.get().startsWith("data:"))
        {
            op.setUiAttrib({ "extendTitle": CABLES.basename(inFile.get()) });
        }

        gltf.loaded = Date.now();
    }

    if (gltf)
    {
        for (let i = 0; i < gltf.nodes.length; i++)
        {
            if (!gltf.nodes[i].isChild)
            {
                gltf.nodes[i].render(cgl, false, true, true, false, true, 0);
            }
        }

        for (let i = 0; i < gltf.nodes.length; i++)
        {
            const node = gltf.nodes[i];
            node.children = CABLES.uniqueArray(node.children); // stupid fix why are there too many children ?!
        }
    }

    updateCenter();
    updateAnimation();

    outLoading.set(false);

    cgl.patch.loading.finished(loadingId);
    loadingId = null;

    // if (gltf.chunks.length > 1) gltf.chunks[1] = null;
    // if (gltf.chunks.length > 2) gltf.chunks[2] = null;

    // op.setUiAttrib({ "accBuffersDelete": CABLES.basename(inFile.get()) });

    if (gltf.accBuffersDelete)
    {
        for (let i = 0; i < gltf.accBuffersDelete.length; i++)
        {
            gltf.accBuffers[gltf.accBuffersDelete[i]] = null;
        }
    }

    // setTimeout(() =>
    // {
    //     for (let i = 0; i < gltf.nodes.length; i++)
    //     {
    //     // console.log(gltf.nodes[i]);

    //         if (gltf.nodes[i].mesh && gltf.nodes[i].mesh.meshes)
    //         {
    //         // console.log(gltf.nodes[i].mesh.meshes.length);
    //             for (let j = 0; j < gltf.nodes[i].mesh.meshes.length; j++)
    //             {
    //                 console.log(gltf.nodes[i].mesh.meshes[j]);

    //                 // for (let k = 0; k < gltf.nodes[i].mesh.meshes.length; k++)
    //                 {
    //                     if (gltf.nodes[i].mesh.meshes[j].mesh)
    //                     {
    //                         gltf.nodes[i].mesh.meshes[j].mesh.freeMem();
    //                         // console.log(gltf.nodes[i].mesh.meshes[j].mesh);
    //                         // for (let l = 0; l < gltf.nodes[i].mesh.meshes[j].mesh._attributes.length; l++)
    //                         //     gltf.nodes[i].mesh.meshes[j].mesh._attributes[l] = null;
    //                     }
    //                 }

    //                 gltf.nodes[i].mesh.meshes[j].geom.clear();
    //                 console.log("clear!");
    //             }
    //         }
    //     }
    // }, 1000);

    if (!(gltf.json.images && gltf.json.images.length)) gltf.chunks = null;

    finishedLoading = true;
}

function loadBin(addCacheBuster)
{
    if (!inActive.get()) return;
    if (!inFile.get()) return;
    if (!loadingId)loadingId = cgl.patch.loading.start("gltfScene", inFile.get(), op);

    unknownCount = 0;
    let fileToLoad = inFile.get();

    if (!fileToLoad || fileToLoad == "null") return;
    let url = op.patch.getFilePath(String(inFile.get()));
    if (!url) return;
    if (inFile.get() && !inFile.get().startsWith("data:"))
    {
        if (addCacheBuster === true)url += "?rnd=" + CABLES.generateUUID();
    }
    needsMatUpdate = true;
    outLoading.set(true);
    fetch(url)
        .then((res) => { return res.arrayBuffer(); })
        .then((arrayBuffer) =>
        {
            if (inFile.get() != fileToLoad)
            {
                cgl.patch.loading.finished(loadingId);
                loadingId = null;
                return;
            }

            boundingPoints = [];
            maxTime = 0;
            gltf = parseGltf(arrayBuffer);
            arrayBuffer = null;
            finishLoading();
        }).catch((e) =>
        {
            if (loadingId)cgl.patch.loading.finished(loadingId);
            loadingId = null;
            finishLoading();

            op.logError("gltf fetch error", e);
        });
    closeTab();

    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    cgl.patch.loading.addAssetLoadingTask(() =>
    {

    });
}

// op.onFileChanged = function (fn)
// {
//     gltf.accBuffersDelete[i];
//     if (fn && fn.length > 3 && inFile.get() && inFile.get().indexOf(fn) > -1) reloadSoon(true);
// };

op.onFileChanged = function (fn)
{
    if (inFile.get() && inFile.get().indexOf(fn) > -1)
    {
        reloadSoon(true);
    }
};

inActive.onChange = () =>
{
    if (inActive.get()) reloadSoon();

    if (!inActive.get())
    {
        gltf = null;
    }
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function () { loadBin(nocache); }, 30);
}

function updateMaterials()
{
    if (!gltf) return;

    gltf.shaders = {};

    if (inMaterials.links.length == 1 && inMaterials.get())
    {
        // just accept a associative object with s
        needsMatUpdate = true;
        const op = inMaterials.links[0].portOut.op;

        const portShader = op.getPort("Shader");
        const portName = op.getPort("Material Name");

        if (!portShader && !portName)
        {
            const inMats = inMaterials.get();
            for (let matname in inMats)
            {
                if (inMats[matname] && gltf.json.materials)
                    for (let i = 0; i < gltf.json.materials.length; i++)
                    {
                        if (gltf.json.materials[i].name == matname)
                        {
                            if (gltf.shaders[i])
                            {
                                op.warn("double material assignment:", name);
                            }
                            gltf.shaders[i] = inMats[matname];
                        }
                    }
            }
        }
    }

    if (inMaterials.get())
    {
        for (let j = 0; j < inMaterials.links.length; j++)
        {
            const op = inMaterials.links[j].portOut.op;
            const portShader = op.getPort("Shader");
            const portName = op.getPort("Material Name");

            if (portShader && portName && portShader.get())
            {
                const name = portName.get();
                if (gltf.json.materials)
                    for (let i = 0; i < gltf.json.materials.length; i++)
                        if (gltf.json.materials[i].name == name)
                        {
                            if (gltf.shaders[i])
                            {
                                op.warn("double material assignment:", name);
                            }
                            gltf.shaders[i] = portShader.get();
                        }
            }
        }
    }
    needsMatUpdate = false;
    if (tab)printInfo();
}

function hideNodesFromArray()
{
    const hideArr = inHideNodes.get();

    if (!gltf || !data || !data.hiddenNodes) return;
    if (!hideArr)
    {
        return;
    }

    for (let i = 0; i < hideArr.length; i++)
    {
        const n = gltf.getNode(hideArr[i]);
        if (n)n.hidden = true;
    }
}

function hideNodesFromData()
{
    if (!data)loadData();
    if (!gltf) return;

    gltf.unHideAll();

    if (data && data.hiddenNodes)
    {
        for (const i in data.hiddenNodes)
        {
            const n = gltf.getNodes(i);
            for (let j = 0; j < n.length; j++)
            {
                if (n[j]) n[j].hidden = true;

                if (n.length === 0) op.verbose("node to be hidden not found", i, n);
            }
        }
    }
    hideNodesFromArray();
}

function loadData()
{
    data = dataPort.get();

    if (!data || data === "")data = {};
    else data = JSON.parse(data);

    if (gltf)hideNodesFromData();

    return data;
}

function saveData()
{
    dataPort.set(JSON.stringify(data));
}

function updateAnimation()
{
    if (gltf && gltf.nodes)
    {
        for (let i = 0; i < gltf.nodes.length; i++)
        {
            gltf.nodes[i].setAnimAction(inAnimation.get());
        }
        const animName = inAnimation.get() || Object.keys(maxTimeDict)[0];
        maxTime = maxTimeDict[animName] || -1;
        outAnimLength.set(maxTime);
    }
}

function findParents(nodes, childNodeIndex)
{
    for (let i = 0; i < gltf.nodes.length; i++)
    {
        if (gltf.nodes[i].children.indexOf(childNodeIndex) >= 0)
        {
            nodes.push(gltf.nodes[i]);
            if (gltf.nodes[i].isChild) findParents(nodes, i);
        }
    }
}

op.exposeTexture = function (name)
{
    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfTexture");
    newop.getPort("Name").set(name);
    setNewOpPosition(newop, 1);
    op.patch.link(op, next.name, newop, "Render");
    gui.patchView.testCollision(newop);
    gui.patchView.centerSelectOp(newop.id, true);
};

op.exposeGeom = function (name, idx)
{
    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfGeometry");
    newop.getPort("Name").set(name);
    newop.getPort("Submesh").set(idx);
    setNewOpPosition(newop, 1);
    op.patch.link(op, next.name, newop, "Update");
    gui.patchView.testCollision(newop);
    gui.patchView.centerSelectOp(newop.id, true);
};

function setNewOpPosition(newOp, num)
{
    num = num || 1;

    newOp.setUiAttrib(
        {
            "subPatch": op.uiAttribs.subPatch,
            "translate": { "x": op.uiAttribs.translate.x, "y": op.uiAttribs.translate.y + num * CABLES.GLUI.glUiConfig.newOpDistanceY }
        });
}

op.exposeNode = function (name, type, options)
{
    let tree = type == "hierarchy";
    if (tree)
    {
        let ops = [];

        for (let i = 0; i < gltf.nodes.length; i++)
        {
            if (gltf.nodes[i].name == name)
            {
                let arrHierarchy = [];
                const node = gltf.nodes[i];
                findParents(arrHierarchy, i);

                arrHierarchy = arrHierarchy.reverse();
                arrHierarchy.push(node, node);

                let prevPort = next.name;
                let prevOp = op;
                for (let j = 0; j < arrHierarchy.length; j++)
                {
                    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfNode_v2");
                    newop.getPort("Node Name").set(arrHierarchy[j].name);
                    op.patch.link(prevOp, prevPort, newop, "Render");
                    setNewOpPosition(newop, j);

                    if (j == arrHierarchy.length - 1)
                    {
                        newop.getPort("Transformation").set(false);
                    }
                    else
                    {
                        newop.getPort("Draw Mesh").set(false);
                        newop.getPort("Draw Childs").set(false);
                    }

                    prevPort = "Next";
                    prevOp = newop;
                    ops.push(newop);
                    gui.patchView.testCollision(newop);
                }
            }
        }

        for (let i = 0; i < ops.length; i++)
        {
            ops[i].selectChilds();
        }
    }
    else
    {
        let newopname = "Ops.Gl.GLTF.GltfNode_v2";
        if (options && options.skin)newopname = "Ops.Gl.GLTF.GltfSkin";
        if (type == "transform")newopname = "Ops.Gl.GLTF.GltfNodeTransform_v2";

        gui.serverOps.loadOpLibs(newopname, () =>
        {
            let newop = gui.corePatch().addOp(newopname);

            newop.getPort("Node Name").set(name);
            setNewOpPosition(newop);
            op.patch.link(op, next.name, newop, "Render");
            gui.patchView.testCollision(newop);
            gui.patchView.centerSelectOp(newop.id, true);
        });
    }
    gui.closeModal();
};

op.assignMaterial = function (name)
{
    const newop = gui.corePatch().addOp("Ops.Gl.GLTF.GltfSetMaterial");
    newop.getPort("Material Name").set(name);
    op.patch.link(op, inMaterials.name, newop, "Material");
    setNewOpPosition(newop);
    gui.patchView.testCollision(newop);
    gui.patchView.centerSelectOp(newop.id, true);

    gui.closeModal();
};

op.toggleNodeVisibility = function (name)
{
    const n = gltf.getNode(name);
    n.hidden = !n.hidden;
    data.hiddenNodes = data.hiddenNodes || {};

    if (n)
        if (n.hidden)data.hiddenNodes[name] = true;
        else delete data.hiddenNodes[name];

    saveData();
};

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.Translate
// 
// **************************************************************

Ops.Gl.Matrix.Translate= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z");

const vec = vec3.create();
op.setUiAxisPorts(x, y, z);

render.onTriggered = function ()
{
    const cgl = op.patch.cg || op.patch.cgl;

    vec3.set(vec, x.get(), y.get(), z.get());
    cgl.pushModelMatrix();
    mat4.translate(cgl.mMatrix, cgl.mMatrix, vec);
    trigger.trigger();
    cgl.popModelMatrix();
};

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.AreaDiscardPixel_v2
// 
// **************************************************************

Ops.Gl.ShaderEffects.AreaDiscardPixel_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"areadiscard_frag":"\n\nfloat MOD_de=0.0;\n\n#ifdef MOD_AREA_SPHERE\n    MOD_de=distance(vec3(MOD_x,MOD_y,MOD_z)/MOD_sizeAxis,MOD_areaPos.xyz/MOD_sizeAxis);\n#endif\n\n#ifdef MOD_AREA_BOX\n    if( abs(MOD_y/MOD_sizeAxis.y-MOD_areaPos.y/(MOD_sizeAxis.y*MOD_size))>0.5 ||\n        abs(MOD_x/MOD_sizeAxis.x-MOD_areaPos.x/(MOD_sizeAxis.x*MOD_size))>0.5 ||\n        abs(MOD_z/MOD_sizeAxis.z-MOD_areaPos.z/(MOD_sizeAxis.z*MOD_size))>0.5 ) MOD_de=1.0;\n#endif\n\n#ifdef MOD_AREA_AXIS_X\n    MOD_de=abs(MOD_x-MOD_areaPos.x);\n#endif\n#ifdef MOD_AREA_AXIS_XY\n    MOD_de=abs(MOD_x-MOD_areaPos.x+MOD_areaPos.y);\n#endif\n#ifdef MOD_AREA_AXIS_XZ\n    MOD_de=abs(MOD_x-MOD_areaPos.x+MOD_areaPos.z);\n#endif\n#ifdef MOD_AREA_AXIS_YZ\n    MOD_de=abs(MOD_y-MOD_areaPos.y+MOD_areaPos.z);\n#endif\n#ifdef MOD_AREA_AXIS_Y\n    MOD_de=abs(MOD_y-MOD_areaPos.y);\n#endif\n#ifdef MOD_AREA_AXIS_Z\n    MOD_de=abs(MOD_z-MOD_areaPos.z);\n#endif\n\n#ifdef MOD_AREA_AXIS_X_INFINITE\n    MOD_de=MOD_x-MOD_areaPos.x;\n#endif\n#ifdef MOD_AREA_AXIS_Y_INFINITE\n    MOD_de=MOD_y-MOD_areaPos.y;\n#endif\n#ifdef MOD_AREA_AXIS_Z_INFINITE\n    MOD_de=MOD_z-MOD_areaPos.z;\n#endif\n\n#ifdef MOD_AREA_REPEAT\n    MOD_de=mod(MOD_de,MOD_size+MOD_repeat);\n#endif\n\nMOD_de=MOD_de/MOD_size;\n\n#ifdef MOD_AREA_INVERT\n    MOD_de=1.0-MOD_de;\n#endif\n\n\nif(MOD_de<=0.5) discard;\n\n","areadiscard_head_frag":"IN vec4 MOD_areaPos;\n",};
const
    render = op.inTrigger("render"),
    inInvert = op.inValueBool("Invert"),
    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis XY", "Axis XZ", "Axis YZ", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inSizeX = op.inValueFloat("Size X", 1),
    inSizeY = op.inValueFloat("Size Y", 1),
    inSizeZ = op.inValueFloat("Size Z", 1),
    inRepeat = op.inValueBool("Repeat"),
    inRepeatDist = op.inValueFloat("Repeat Distance", 0.0),
    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    inWorldSpace = op.inValueBool("WorldSpace", true),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

op.setPortGroup("Size", [inSize, inSizeY, inSizeX, inSizeZ]);
op.setPortGroup("Position", [x, y, z, inWorldSpace]);


const srcHeadVert = ""
    .endl() + "OUT vec4 MOD_areaPos;"
    .endl();

const srcBodyVert = ""
    .endl() + "#ifndef MOD_WORLDSPACE"
    .endl() + "   MOD_areaPos=pos;"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_WORLDSPACE"
    .endl() + "   MOD_areaPos=mMatrix*pos;"
    .endl() + "#endif"
    .endl();

inWorldSpace.onChange =
inInvert.onChange =
inRepeat.onChange =
inArea.onChange = updateDefines;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "priority": 2,
    "title": op.objName,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});
mod.addModule({
    "title": op.objName,
    "name": "MODULE_COLOR",
    "srcHeadFrag": attachments.areadiscard_head_frag || "",
    "srcBodyFrag": attachments.areadiscard_frag || ""
});

mod.addUniformFrag("f", "MOD_size", inSize);
mod.addUniformFrag("f", "MOD_x", x);
mod.addUniformFrag("f", "MOD_y", y);
mod.addUniformFrag("f", "MOD_z", z);
mod.addUniformFrag("3f", "MOD_sizeAxis", inSizeX, inSizeY, inSizeZ);
mod.addUniformFrag("f", "MOD_repeat", inRepeatDist);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_AREA_INVERT", inInvert.get());
    mod.toggleDefine("MOD_AREA_REPEAT", inRepeat.get());
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");
    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_XY", inArea.get() == "Axis XY");
    mod.toggleDefine("MOD_AREA_AXIS_XZ", inArea.get() == "Axis XZ");
    mod.toggleDefine("MOD_AREA_AXIS_YZ", inArea.get() == "Axis YZ");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
}

render.onTriggered = function ()
{
    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": x,
                "posY": y,
                "posZ": z
            });

    if (cgl.shouldDrawHelpers(op)) CABLES.GL_MARKER.drawSphere(op, inSize.get());

    mod.bind();
    next.trigger();
    mod.unbind();
};

}
};






// **************************************************************
// 
// Ops.Array.ArrayUnpack3
// 
// **************************************************************

Ops.Array.ArrayUnpack3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const inArray1 = op.inArray("Array in xyz"),
    outArray1 = op.outArray("Array 1 out"),
    outArray2 = op.outArray("Array 2 out"),
    outArray3 = op.outArray("Array 3 out"),
    outArrayLength = op.outNumber("Array lengths");

let showingError = false;

const arr1 = [];
const arr2 = [];
const arr3 = [];

inArray1.onChange = update;

function update()
{
    let array1 = inArray1.get();

    if (!array1)
    {
        outArray1.set(null);
        return;
    }

    if (array1.length % 3 !== 0)
    {
        if (!showingError)
        {
            op.uiAttr({ "error": "Arrays length not divisible by 3 !" });
            outArrayLength.set(0);
            showingError = true;
        }
        return;
    }

    if (showingError)
    {
        showingError = false;
        op.uiAttr({ "error": null });
    }

    arr1.length = Math.floor(array1.length / 3);
    arr2.length = Math.floor(array1.length / 3);
    arr3.length = Math.floor(array1.length / 3);

    for (let i = 0; i < array1.length / 3; i++)
    {
        arr1[i] = array1[i * 3];
        arr2[i] = array1[i * 3 + 1];
        arr3[i] = array1[i * 3 + 2];
    }

    // outArray1.set(null);
    // outArray2.set(null);
    // outArray3.set(null);
    outArray1.setRef(arr1);
    outArray2.setRef(arr2);
    outArray3.setRef(arr3);
    outArrayLength.set(arr1.length);
}

}
};






// **************************************************************
// 
// Ops.Array.ArrayPack3
// 
// **************************************************************

Ops.Array.ArrayPack3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const exe = op.inTrigger("Trigger in"),
    inArr1 = op.inArray("Array 1"),
    inArr2 = op.inArray("Array 2"),
    inArr3 = op.inArray("Array 3"),
    exeOut = op.outTrigger("Trigger out"),
    outArr = op.outArray("Array out", 3),
    outNum = op.outNumber("Num Points"),
    outArrayLength = op.outNumber("Array length");

let showingError = false;

let arr = [];
let emptyArray = [];
let needsCalc = true;

exe.onTriggered = update;

inArr1.onChange = inArr2.onChange = inArr3.onChange = calcLater;

function calcLater()
{
    needsCalc = true;
}

function update()
{
    let array1 = inArr1.get();
    let array2 = inArr2.get();
    let array3 = inArr3.get();

    if (!array1 && !array2 && !array3)
    {
        outArr.set(null);
        outNum.set(0);
        return;
    }
    // only update if array has changed
    if (needsCalc)
    {
        let arrlen = 0;

        if (!array1 || !array2 || !array3)
        {
            if (array1) arrlen = array1.length;
            else if (array2) arrlen = array2.length;
            else if (array3) arrlen = array3.length;

            if (emptyArray.length != arrlen)
                for (let i = 0; i < arrlen; i++) emptyArray[i] = 0;

            if (!array1)array1 = emptyArray;
            if (!array2)array2 = emptyArray;
            if (!array3)array3 = emptyArray;
        }

        if ((array1.length !== array2.length) || (array2.length !== array3.length))
        {
            op.setUiError("arraylen", "Arrays do not have the same length !");
            return;
        }
        op.setUiError("arraylen", null);

        arr.length = array1.length;
        for (let i = 0; i < array1.length; i++)
        {
            arr[i * 3 + 0] = array1[i];
            arr[i * 3 + 1] = array2[i];
            arr[i * 3 + 2] = array3[i];
        }

        needsCalc = false;
        outArr.setRef(arr);
        outNum.set(arr.length / 3);
        outArrayLength.set(arr.length);
    }

    exeOut.trigger();
}

}
};






// **************************************************************
// 
// Ops.Array.Math.ArrayMultiply
// 
// **************************************************************

Ops.Array.Math.ArrayMultiply= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inArray = op.inArray("In"),
    inValue = op.inValue("Value", 1.0),
    outArray = op.outArray("Result");

let newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let mul = inValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++) newArr[i] = arr[i] * mul;

    outArray.setRef(newArr);
};

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

}
};






// **************************************************************
// 
// Ops.Array.ArraySum
// 
// **************************************************************

Ops.Array.ArraySum= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inArray = op.inArray("In"),
    inValue = op.inValue("Value", 1.0),
    outArray = op.outArray("Result");

let newArr = [];
outArray.set(newArr);

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

inValue.onChange =
inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let add = inValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++)
    {
        newArr[i] = arr[i] + add;
    }

    outArray.setRef(newArr);
};

}
};






// **************************************************************
// 
// Ops.Array.Math.ArrayModulo
// 
// **************************************************************

Ops.Array.Math.ArrayModulo= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inArray = op.inArray("Array In"),
    inValue = op.inValue("Value", 2.0),
    outArray = op.outArray("Array Out");

let newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let modulo = inValue.get();

    if (newArr.length != arr.length) newArr.length = arr.length;

    let i = 0;
    for (i = 0; i < arr.length; i++)
    {
        newArr[i] = arr[i] % modulo;
    }
    outArray.setRef(newArr);
};

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

}
};






// **************************************************************
// 
// Ops.Array.ArraySubtract
// 
// **************************************************************

Ops.Array.ArraySubtract= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inArray = op.inArray("Array In"),
    inValue = op.inValue("Value", 1.0),
    inMode = op.inSwitch("Mode", ["Array-x", "x-Array"], "Array-x"),
    outArray = op.outArray("Array Out");

let newArr = [];
let mode = true;

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

inMode.onChange = () =>
{
    mode = inMode.get() === "Array-x";
    update();
};

outArray.set(newArr);

inArray.onChange =
    inValue.onChange = update;

function update()
{
    let arr = inArray.get();
    if (!arr) return;

    let subtract = inValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    let i = 0;

    if (mode)
        for (i = 0; i < arr.length; i++) newArr[i] = arr[i] - subtract;
    else
        for (i = 0; i < arr.length; i++) newArr[i] = subtract - arr[i];

    outArray.setRef(newArr);
}

}
};






// **************************************************************
// 
// Ops.Math.Divide
// 
// **************************************************************

Ops.Math.Divide= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    number1 = op.inValueFloat("number1", 1),
    number2 = op.inValueFloat("number2", 2),
    result = op.outNumber("result");

op.setUiAttribs({ "mathTitle": true });

number1.onChange = number2.onChange = exec;
exec();

function exec()
{
    result.set(number1.get() / number2.get());
}

}
};






// **************************************************************
// 
// Ops.Array.Math.ArraySin
// 
// **************************************************************

Ops.Array.Math.ArraySin= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// this op allows the user to perform sin or cos
// math functions on an array
const inArray = op.inArray("array in");
const mathSelect = op.inValueSelect("Math function", ["Sin", "Cos"], "Sin");
const outArray = op.outArray("Array result");

const phase = op.inValue("Phase", 0.0);
const multiply = op.inValue("Frequency", 1.0);
const amplitude = op.inValue("Amplitude", 1.0);

const mathArray = [];
let selectIndex = 0;

const MATH_FUNC_SIN = 0;
const MATH_FUNC_COS = 1;

inArray.onChange = update;
multiply.onChange = update;
amplitude.onChange = update;
phase.onChange = update;
mathSelect.onChange = onFilterChange;

function onFilterChange()
{
    const mathSelectValue = mathSelect.get();
    if (mathSelectValue === "Sin") selectIndex = MATH_FUNC_SIN;
    else if (mathSelectValue === "Cos") selectIndex = MATH_FUNC_COS;
    update();
}

function update()
{
    const arrayIn = inArray.get();

    if (!arrayIn)
    {
        mathArray.length = 0;
        return;
    }

    mathArray.length = arrayIn.length;

    const amp = amplitude.get();
    const mul = multiply.get();
    const pha = phase.get();

    let i = 0;
    if (selectIndex === MATH_FUNC_SIN)
    {
        for (i = 0; i < arrayIn.length; i++)
            mathArray[i] = amp * Math.sin((arrayIn[i]) * mul + pha);
    }
    else if (selectIndex === MATH_FUNC_COS)
    {
        for (i = 0; i < arrayIn.length; i++)
            mathArray[i] = amp * (Math.cos(arrayIn[i] * mul + pha));
    }
    // outArray.set(null);
    outArray.setRef(mathArray);
}

}
};






// **************************************************************
// 
// Ops.Array.Math.ArrayMathArray
// 
// **************************************************************

Ops.Array.Math.ArrayMathArray= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const inArray_0 = op.inArray("array 0"),
    inArray_1 = op.inArray("array 1"),
    mathSelect = op.inSwitch("Math function", ["+", "-", "*", "/", "%", "min", "max"], "+"),
    outArray = op.outArray("Array result"),
    outArrayLength = op.outNumber("Array length");

let mathFunc;

let showingError = false;

const mathArray = [];

op.toWorkPortsNeedToBeLinked(inArray_1, inArray_0);

mathSelect.onChange = onFilterChange;

inArray_0.onChange = inArray_1.onChange = update;
onFilterChange();

function onFilterChange()
{
    const mathSelectValue = mathSelect.get();

    if (mathSelectValue === "+") mathFunc = function (a, b) { return a + b; };
    else if (mathSelectValue === "-") mathFunc = function (a, b) { return a - b; };
    else if (mathSelectValue === "*") mathFunc = function (a, b) { return a * b; };
    else if (mathSelectValue === "/") mathFunc = function (a, b) { return a / b; };
    else if (mathSelectValue === "%") mathFunc = function (a, b) { return a % b; };
    else if (mathSelectValue === "min") mathFunc = function (a, b) { return Math.min(a, b); };
    else if (mathSelectValue === "max") mathFunc = function (a, b) { return Math.max(a, b); };
    update();
    op.setUiAttrib({ "extendTitle": mathSelectValue });
}

function update()
{
    const array0 = inArray_0.get();
    const array1 = inArray_1.get();

    if (!array0 || !array1)
    {
        outArray.set(null);
        outArrayLength.set(0);
        return;
    }

    const l = mathArray.length = array0.length;

    for (let i = 0; i < l; i++)
    {
        mathArray[i] = mathFunc(array0[i], array1[i]);
    }

    outArrayLength.set(mathArray.length);
    outArray.setRef(mathArray);
}

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.VertexWobble_v2
// 
// **************************************************************

Ops.Gl.ShaderEffects.VertexWobble_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"sinewobble_vert":"\n#ifndef MOD_WORLDSPACE\n   vec4 MOD_vertPos=vec4(pos.xyz,1.0);\n#endif\n#ifdef MOD_WORLDSPACE\n   vec4 MOD_vertPos=mMatrix*pos;\n#endif\n\n#ifdef MOD_AREA_SPHERE\n    float MOD_de=distance(\n        MOD_posSize.xyz,\n        vec3(MOD_vertPos.x,MOD_vertPos.y,MOD_vertPos.z)\n        );\n#endif\n\n#ifdef MOD_AREA_BOX\n    float MOD_de=0.0;\n    if(abs(MOD_vertPos.y-MOD_posSize.y)>MOD_posSize.w ||\n        abs(MOD_vertPos.x-MOD_posSize.x)>MOD_posSize.w ||\n        abs(MOD_vertPos.z-MOD_posSize.z)>MOD_posSize.w ) MOD_de=1.0;\n#endif\n\n#ifdef MOD_AREA_AXIS_X\n    float MOD_de=abs(MOD_posSize.x-MOD_vertPos.x);\n#endif\n#ifdef MOD_AREA_AXIS_Y\n    float MOD_de=abs(MOD_posSize.y-MOD_vertPos.y);\n#endif\n#ifdef MOD_AREA_AXIS_Z\n    float MOD_de=abs(MOD_posSize.z-MOD_vertPos.z);\n#endif\n\n#ifdef MOD_AREA_AXIS_X_INFINITE\n    float MOD_de=MOD_posSize.x-MOD_vertPos.x;\n#endif\n#ifdef MOD_AREA_AXIS_Y_INFINITE\n    float MOD_de=MOD_posSize.y-MOD_vertPos.y;\n#endif\n#ifdef MOD_AREA_AXIS_Z_INFINITE\n    float MOD_de=MOD_posSize.z-MOD_vertPos.z;\n#endif\n\n#ifndef MOD_AREA_BOX\n    MOD_de=1.0-smoothstep(MOD_falloff,MOD_posSize.w,MOD_de);\n#endif\n\n#ifdef MOD_AREA_INVERT\n    MOD_de=1.0-MOD_de;\n#endif\n\nfloat MOD_v=0.0;\n\n#ifdef MOD_SRC_XZ\n   MOD_v=(MOD_vertPos.x+MOD_vertPos.z);\n#endif\n#ifdef MOD_SRC_XY\n   MOD_v=(MOD_vertPos.x+MOD_vertPos.y);\n#endif\n#ifdef MOD_SRC_X\n   MOD_v=MOD_vertPos.x;\n#endif\n#ifdef MOD_SRC_Y\n   MOD_v=MOD_vertPos.y;\n#endif\n#ifdef MOD_SRC_Z\n   MOD_v=MOD_vertPos.z;\n#endif\n\n#ifdef MOD_SRC_LENGTH\n  MOD_v=length(MOD_vertPos.xyz);\n#endif\n\n\nfloat MOD_amnt=MOD_amount*MOD_de;\n\nMOD_v=sin( (MOD_time)+( MOD_v*MOD_scale  ) ) ;\n#ifdef MOD_POSITIVE\n    MOD_v=(MOD_v+1.0)/2.0;\n#endif\nMOD_v*=MOD_amnt;\n\n\n\n\n#ifdef MOD_TO_AXIS_X\n   pos.x+=MOD_v;\n//   norm.x+=MOD_v;\n#endif\n\n#ifdef MOD_TO_AXIS_Y\n   pos.y+=MOD_v;\n//   norm.y+=MOD_v;\n#endif\n\n#ifdef MOD_TO_AXIS_Z\n   pos.z+=MOD_v;\n//   norm.z+=MOD_v;\n#endif\n\n// norm=normalize(norm);\n\n\n\n\n\n",};
let self = this;
const cgl = op.patch.cgl;

const render = op.inTrigger("render");
let src = op.inValueSelect("Source", [
    "X * Z + Time",
    "X * Y + Time",
    "length",
    "X + Time",
    "Y + Time",
    "Z + Time"], "X * Z + Time");

const
    amount = op.inValueSlider("amount", 0.1),
    inTime = op.inFloat("Time", 0),
    mul = op.inValueFloat("Scale", 3),
    toAxisX = op.inValueBool("axisX", true),
    toAxisY = op.inValueBool("axisY", true),
    toAxisZ = op.inValueBool("axisZ", true),
    positive = op.inSwitch("Range", ["-1 to 1", "0 to 1"], "-1 to 1"),

    inArea = op.inValueSelect("Area", ["Sphere", "Box", "Axis X", "Axis Y", "Axis Z", "Axis X Infinite", "Axis Y Infinite", "Axis Z Infinite"], "Sphere"),
    inSize = op.inValue("Size", 1),
    inFalloff = op.inValueSlider("Falloff", 0),

    x = op.inValue("x"),
    y = op.inValue("y"),
    z = op.inValue("z"),
    inWorldSpace = op.inValueBool("WorldSpace", true),
    inInvert = op.inValueBool("Invert"),

    next = this.outTrigger("trigger");

op.setPortGroup("Area", [inArea, inSize, x, y, z, inFalloff, inWorldSpace, inInvert]);

positive.onChange =
inArea.onChange =
    inWorldSpace.onChange =
    inSize.onChange =
    src.onChange =
    toAxisZ.onChange =
    toAxisX.onChange =
    toAxisY.onChange = setDefines;

const srcHeadVert = "";
// let startTime = CABLES.now() / 1000.0;
const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });

mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": attachments.sinewobble_vert
});

mod.addUniform("4f", "MOD_posSize", x, y, z, inSize);
mod.addUniformVert("f", "MOD_time", inTime);
mod.addUniformVert("f", "MOD_amount", amount);
mod.addUniformVert("f", "MOD_scale", mul);
mod.addUniformVert("f", "MOD_falloff", inFalloff);

setDefines();

function setDefines()
{
    mod.toggleDefine("MOD_AREA_INVERT", inInvert.get());
    mod.toggleDefine("MOD_POSITIVE", positive.get() == "0 to 1");

    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_AREA_AXIS_X", inArea.get() == "Axis X");
    mod.toggleDefine("MOD_AREA_AXIS_Y", inArea.get() == "Axis Y");
    mod.toggleDefine("MOD_AREA_AXIS_Z", inArea.get() == "Axis Z");
    mod.toggleDefine("MOD_AREA_AXIS_X_INFINITE", inArea.get() == "Axis X Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Y_INFINITE", inArea.get() == "Axis Y Infinite");
    mod.toggleDefine("MOD_AREA_AXIS_Z_INFINITE", inArea.get() == "Axis Z Infinite");
    mod.toggleDefine("MOD_AREA_SPHERE", inArea.get() == "Sphere");
    mod.toggleDefine("MOD_AREA_BOX", inArea.get() == "Box");

    mod.toggleDefine("MOD_TO_AXIS_X", toAxisX.get());
    mod.toggleDefine("MOD_TO_AXIS_Y", toAxisY.get());
    mod.toggleDefine("MOD_TO_AXIS_Z", toAxisZ.get());
    mod.toggleDefine("MOD_SRC_XZ", !src.get() || src.get() == "X * Z + Time" || src.get() === "");
    mod.toggleDefine("MOD_SRC_XY", src.get() == "X * Y + Time");
    mod.toggleDefine("MOD_SRC_X", src.get() == "X + Time");
    mod.toggleDefine("MOD_SRC_Y", src.get() == "Y + Time");
    mod.toggleDefine("MOD_SRC_Z", src.get() == "Z + Time");
    mod.toggleDefine("MOD_SRC_LENGTH", src.get() == "length");
}

render.onTriggered = function ()
{
    mod.bind();
    next.trigger();
    mod.unbind();
};

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.Scale
// 
// **************************************************************

Ops.Gl.Matrix.Scale= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    scale = op.inValueFloat("scale", 1.0),
    scaleX = op.inValueFloat("x", 1),
    scaleY = op.inValueFloat("y", 1),
    scaleZ = op.inValueFloat("z", 1),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Axis", [scaleX, scaleY, scaleZ]);

const vScale = vec3.create();

scaleX.onChange =
    scaleY.onChange =
    scaleZ.onChange =
    scale.onChange = scaleChanged;

scaleChanged();

render.onTriggered = function ()
{
    const cgl = op.patch.cg || op.patch.cgl;
    cgl.pushModelMatrix();
    mat4.scale(cgl.mMatrix, cgl.mMatrix, vScale);
    trigger.trigger();
    cgl.popModelMatrix();
};

function scaleChanged()
{
    const s = scale.get();
    vec3.set(vScale, s * scaleX.get(), s * scaleY.get(), s * scaleZ.get());
}

}
};






// **************************************************************
// 
// Ops.Gl.GLTF.GltfDracoCompression
// 
// **************************************************************

Ops.Gl.GLTF.GltfDracoCompression= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
class DracoDecoderClass
{
    constructor()
    {
        this.workerLimit = 4;
        this.workerPool = [];
        this.workerNextTaskID = 1;
        this.workerSourceURL = "";

        this.config = {
            "wasm": Uint8Array.from(atob(DracoDecoderWASM), (c) => { return c.charCodeAt(0); }),
            "wrapper": DracoWASMWrapperCode,
            "decoderSettings": {},
        };

        const dracoWorker = this._DracoWorker.toString();
        const workerCode = dracoWorker.substring(dracoWorker.indexOf("{") + 1, dracoWorker.lastIndexOf("}"));

        const jsContent = this.config.wrapper;
        const body = [
            "/* draco decoder */",
            jsContent,
            "",
            "/* worker */",
            workerCode
        ].join("\n");

        this.workerSourceURL = URL.createObjectURL(new Blob([body]));
    }

    _getWorker(taskID, taskCost)
    {
        if (this.workerPool.length < this.workerLimit)
        {
            const worker = new Worker(this.workerSourceURL);
            worker._callbacks = {};
            worker._taskCosts = {};
            worker._taskLoad = 0;
            worker.postMessage({ "type": "init", "decoderConfig": this.config });
            worker.onmessage = (e) =>
            {
                const message = e.data;

                switch (message.type)
                {
                case "done":
                    worker._callbacks[message.taskID].finishedCallback(message.geometry);
                    break;

                case "error":
                    worker._callbacks[message.taskID].errorCallback(message);
                    break;

                default:
                    op.error("THREE.DRACOLoader: Unexpected message, \"" + message.type + "\"");
                }
                this._releaseTask(worker, message.taskID);
            };
            this.workerPool.push(worker);
        }
        else
        {
            this.workerPool.sort(function (a, b)
            {
                return a._taskLoad > b._taskLoad ? -1 : 1;
            });
        }

        const worker = this.workerPool[this.workerPool.length - 1];
        worker._taskCosts[taskID] = taskCost;
        worker._taskLoad += taskCost;
        return worker;
    }

    decodeGeometry(buffer, finishedCallback, errorCallback = null)
    {
        const taskID = this.workerNextTaskID++;
        const taskCost = buffer.byteLength;

        const worker = this._getWorker(taskID, taskCost);
        worker._callbacks[taskID] = { finishedCallback, errorCallback };
        worker.postMessage({ "type": "decode", "taskID": taskID, buffer }, [buffer]);
    }

    _releaseTask(worker, taskID)
    {
        worker._taskLoad -= worker._taskCosts[taskID];
        delete worker._callbacks[taskID];
        delete worker._taskCosts[taskID];
    }

    _DracoWorker()
    {
        let pendingDecoder;

        onmessage = function (e)
        {
            const message = e.data;
            switch (message.type)
            {
            case "init":
                const decoderConfig = message.decoderConfig;
                const moduleConfig = decoderConfig.decoderSettings;
                pendingDecoder = new Promise(function (resolve)
                {
                    moduleConfig.onModuleLoaded = function (draco)
                    {
                        // Module is Promise-like. Wrap before resolving to avoid loop.
                        resolve({ "draco": draco });
                    };
                    moduleConfig.wasmBinary = decoderConfig.wasm;
                    DracoDecoderModule(moduleConfig); // eslint-disable-line no-undef
                });
                break;
            case "decode":
                pendingDecoder.then((module) =>
                {
                    const draco = module.draco;

                    const f = new draco.Decoder();
                    const dataBuff = new Int8Array(message.buffer);

                    const geometryType = f.GetEncodedGeometryType(dataBuff);
                    const buffer = new draco.DecoderBuffer();
                    buffer.Init(dataBuff, dataBuff.byteLength);

                    let outputGeometry = new draco.Mesh();
                    const status = f.DecodeBufferToMesh(buffer, outputGeometry);
                    const attribute = f.GetAttributeByUniqueId(outputGeometry, 1);
                    const geometry = dracoAttributes(draco, f, outputGeometry, geometryType, name);

                    this.postMessage({ "type": "done", "taskID": message.taskID, "geometry": geometry });

                    draco.destroy(f);
                    draco.destroy(buffer);
                });
                break;
            }
        };

        let dracoAttributes = function (draco, decoder, dracoGeometry, geometryType, name)
        {
            const attributeIDs = {
                "position": draco.POSITION,
                "normal": draco.NORMAL,
                "color": draco.COLOR,
                "uv": draco.TEX_COORD,
                "joints": draco.GENERIC,
                "weights": draco.GENERIC,
            };
            const attributeTypes = {
                "position": "Float32Array",
                "normal": "Float32Array",
                "color": "Float32Array",
                "weights": "Float32Array",
                "joints": "Uint8Array",
                "uv": "Float32Array"
            };

            const geometry = {
                "index": null,
                "attributes": []
            };

            let count = 0;
            for (const attributeName in attributeIDs)
            {
                const attributeType = attributeTypes[attributeName];
                let attributeID = decoder.GetAttributeId(dracoGeometry, attributeIDs[attributeName]);

                count++;
                if (attributeID != -1)
                {
                    let attribute = decoder.GetAttribute(dracoGeometry, attributeID);
                    geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute));
                }
            }

            if (geometryType === draco.TRIANGULAR_MESH) geometry.index = decodeIndex(draco, decoder, dracoGeometry);
            else op.warn("unknown draco geometryType", geometryType);

            draco.destroy(dracoGeometry);
            return geometry;
        };

        let decodeIndex = function (draco, decoder, dracoGeometry)
        {
            const numFaces = dracoGeometry.num_faces();
            const numIndices = numFaces * 3;
            const byteLength = numIndices * 4;
            const ptr = draco._malloc(byteLength);

            decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
            const index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice();

            draco._free(ptr);

            return {
                "array": index,
                "itemSize": 1
            };
        };

        let decodeAttribute = function (draco, decoder, dracoGeometry, attributeName, attributeType, attribute)
        {
            let bytesPerElement = 4;
            if (attributeType === "Float32Array") bytesPerElement = 4;
            else if (attributeType === "Uint8Array") bytesPerElement = 1;
            else op.warn("unknown attrtype bytesPerElement", attributeType);

            const numComponents = attribute.num_components();
            const numPoints = dracoGeometry.num_points();
            const numValues = numPoints * numComponents;
            const byteLength = numValues * bytesPerElement;
            const dataType = getDracoDataType(draco, attributeType);
            const ptr = draco._malloc(byteLength);
            let array = null;

            decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, dataType, byteLength, ptr);

            if (attributeType === "Float32Array") array = new Float32Array(draco.HEAPF32.buffer, ptr, numValues).slice();
            else if (attributeType === "Uint8Array") array = new Uint8Array(draco.HEAPF32.buffer, ptr, numValues).slice();
            else op.warn("unknown attrtype", attributeType);

            draco._free(ptr);

            return {
                "name": attributeName,
                "array": array,
                "itemSize": numComponents
            };
        };

        let getDracoDataType = function (draco, attributeType)
        {
            switch (attributeType)
            {
            case "Float32Array": return draco.DT_FLOAT32;
            case "Int8Array": return draco.DT_INT8;
            case "Int16Array": return draco.DT_INT16;
            case "Int32Array": return draco.DT_INT32;
            case "Uint8Array": return draco.DT_UINT8;
            case "Uint16Array": return draco.DT_UINT16;
            case "Uint32Array": return draco.DT_UINT32;
            }
        };
    }
}

window.DracoDecoder = new DracoDecoderClass();

}
};






// **************************************************************
// 
// Ops.Array.RandomNumbersArray_v4
// 
// **************************************************************

Ops.Array.RandomNumbersArray_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    numValues = op.inValueInt("Num Values", 100),
    inModeSwitch = op.inSwitch("Mode", ["A", "AB", "ABC", "ABCD"], "A"),
    inSeed = op.inValueFloat("Random Seed ", 0),
    inInteger = op.inBool("Integer", false),
    inClosed = op.inValueBool("Last == First"),
    outValues = op.outArray("Array Out"),
    outTotalPoints = op.outNumber("Chunks Amount"),
    outArrayLength = op.outNumber("Array length");

const letters = ["A", "B", "C", "D"];
const arr = [];

const inArray = letters.map(function (value)
{
    return {
        "min": op.inValueFloat("Min " + value, -1),
        "max": op.inValueFloat("Max " + value, 1),
    };
});

for (let i = 0; i < inArray.length; i += 1)
{
    const portObj = inArray[i];
    const keys = Object.keys(portObj);

    op.setPortGroup("Value Range " + letters[i], keys.map(function (key) { return portObj[key]; }));

    if (i > 0) keys.forEach(function (key) { portObj[key].setUiAttribs({ "greyout": true }); });
}

inModeSwitch.onChange = function ()
{
    const mode = inModeSwitch.get();
    const modes = inModeSwitch.uiAttribs.values;

    outValues.setUiAttribs({ "stride": inModeSwitch.get().length });

    const index = modes.indexOf(mode);

    inArray.forEach(function (portObj, i)
    {
        const keys = Object.keys(portObj);
        keys.forEach(function (key, j)
        {
            if (i <= index) portObj[key].setUiAttribs({ "greyout": false });
            else portObj[key].setUiAttribs({ "greyout": true });
        });
    });
    init();
};

outValues.ignoreValueSerialize = true;

inClosed.onChange =
    numValues.onChange =
    inSeed.onChange =
    inInteger.onChange = init;

const minMaxArray = [];

init();

function init()
{
    const mode = inModeSwitch.get();
    const modes = inModeSwitch.uiAttribs.values;
    const index = modes.indexOf(mode);

    const n = Math.floor(Math.abs(numValues.get()));
    Math.randomSeed = inSeed.get();

    op.setUiAttrib({ "extendTitle": n + "*" + mode.length });

    const dimension = index + 1;
    const length = n * dimension;

    arr.length = length;
    const tupleLength = length / dimension;
    const isInteger = inInteger.get();

    // optimization: we only need to fetch the max min for each component once
    for (let i = 0; i < dimension; i += 1)
    {
        const portObj = inArray[i];
        const max = portObj.max.get();
        const min = portObj.min.get();
        minMaxArray[i] = [min, max];
    }

    for (let j = 0; j < tupleLength; j += 1)
    {
        for (let k = 0; k < dimension; k += 1)
        {
            const min = minMaxArray[k][0];
            const max = minMaxArray[k][1];
            const index = j * dimension + k;

            if (isInteger) arr[index] = Math.floor(Math.seededRandom() * ((max + 1) - min) + min);
            else arr[index] = Math.seededRandom() * (max - min) + min;
        }
    }

    if (inClosed.get() && arr.length > dimension)
    {
        for (let i = 0; i < dimension; i++)
            arr[arr.length - 3 + i] = arr[i];
    }

    outValues.setRef(arr);
    outTotalPoints.set(arr.length / dimension);
    outArrayLength.set(arr.length);
}

// assign change handler
inArray.forEach(function (obj)
{
    Object.keys(obj).forEach(function (key)
    {
        const x = obj[key];
        x.onChange = init;
    });
});

}
};






// **************************************************************
// 
// Ops.Array.ArrayLength_v2
// 
// **************************************************************

Ops.Array.ArrayLength_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    array = op.inArray("array"),
    outLength = op.outNumber("length");

outLength.ignoreValueSerialize = true;

function update()
{
    let l = 0;
    if (array.get()) l = array.get().length;
    outLength.set(l);
}

array.onChange = update;

}
};






// **************************************************************
// 
// Ops.Array.Array_v3
// 
// **************************************************************

Ops.Array.Array_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inLength = op.inValueInt("Array length", 10),
    modeSelect = op.inSwitch("Mode select", ["Number", "1,2,3,4", "0-1"], "Number"),
    inDefaultValue = op.inValueFloat("Default Value"),
    inReverse = op.inBool("Reverse", false),
    outArr = op.outArray("Array"),
    outArrayLength = op.outNumber("Array length out");

let arr = [];
let selectIndex = 0;
const MODE_NUMBER = 0;
const MODE_1_TO_4 = 1;
const MODE_0_TO_1 = 2;

modeSelect.onChange = onFilterChange;

inReverse.onChange =
    inDefaultValue.onChange =
    inLength.onChange = reset;

onFilterChange();
reset();

function onFilterChange()
{
    let selectedMode = modeSelect.get();
    if (selectedMode === "Number") selectIndex = MODE_NUMBER;
    else if (selectedMode === "1,2,3,4") selectIndex = MODE_1_TO_4;
    else if (selectedMode === "0-1") selectIndex = MODE_0_TO_1;

    inDefaultValue.setUiAttribs({ "greyout": selectIndex !== MODE_NUMBER });

    op.setUiAttrib({ "extendTitle": modeSelect.get() });

    reset();
}

function reset()
{
    arr.length = 0;

    let arrLength = inLength.get();
    let valueForArray = inDefaultValue.get();
    let i;

    // mode 0 - fill all array values with one number
    if (selectIndex === MODE_NUMBER)
    {
        for (i = 0; i < arrLength; i++)
        {
            arr[i] = valueForArray;
        }
    }
    // mode 1 Continuous number array - increments up to array length
    else if (selectIndex === MODE_1_TO_4)
    {
        for (i = 0; i < arrLength; i++)
        {
            arr[i] = i;
        }
    }
    // mode 2 Normalized array
    else if (selectIndex === MODE_0_TO_1)
    {
        if (arrLength > 1) { 
            for (i = 0; i < arrLength; i++)
                {
                    arr[i] = i / (arrLength - 1);
                }
        } else 
        {
            //When array length is only 1 
            arr = [0];
        }
    }

    if (inReverse.get())arr = arr.reverse();

    outArr.setRef(arr);
    outArrayLength.set(arr.length);
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Wobble_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Wobble_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"wobble_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI sampler2D texMask;\nUNI float time;\nUNI float speedX;\nUNI float speedY;\nUNI float repeatX;\nUNI float repeatY;\nUNI float mul;\n\n{{CGL.LUMINANCE}}\n\nvoid main()\n{\n    float mult=1.0;\n    #ifdef HAS_MASK\n        #ifdef MASK_SRC_R\n            mult*=texture(texMask,texCoord).r;\n        #endif\n        #ifdef MASK_SRC_G\n            mult*=texture(texMask,texCoord).g;\n        #endif\n        #ifdef MASK_SRC_B\n            mult*=texture(texMask,texCoord).b;\n        #endif\n        #ifdef MASK_SRC_A\n            mult*=texture(texMask,texCoord).a;\n        #endif\n        #ifdef MASK_SRC_LUM\n            mult*=cgl_luminance(texture(texMask,texCoord).rgb);\n        #endif\n        #ifdef MASK_INV\n            mult=1.0-mult;\n        #endif\n    #endif\n\n    mult*=mul;\n\n    vec2 tc = texCoord + cos( (time*vec2(speedX, speedY) + vec2(texCoord.s*repeatX,texCoord.t*repeatY)))*mult;\n    vec4 col=texture(tex,tc);\n\n    outColor= col;\n}",};
const
    render = op.inTrigger("Render"),
    time = op.inValue("time", 0),
    speedX = op.inValue("SpeedX", 4),
    speedY = op.inValue("SpeedY", 8),

    repeatX = op.inValue("RepeatX", 11),
    repeatY = op.inValue("RepeatY", 11),
    mul = op.inValue("Multiply", 0.01),

    inMaskTex = op.inTexture("Amount Map"),
    inMaskSource = op.inSwitch("Source Amount Map", ["R", "G", "B", "A", "Lum"], "R"),
    inMaskInv = op.inBool("Invert Amount Map", false),

    trigger = op.outTrigger("Trigger");

op.setPortGroup("Amount Map", [inMaskTex, inMaskSource, inMaskInv]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.wobble_frag);
const textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    timeUniform = new CGL.Uniform(shader, "f", "time", time),
    speedXUniform = new CGL.Uniform(shader, "f", "speedX", speedX),
    speedYUniform = new CGL.Uniform(shader, "f", "speedY", speedY),
    repeatXUniform = new CGL.Uniform(shader, "f", "repeatX", repeatX),
    repeatYUniform = new CGL.Uniform(shader, "f", "repeatY", repeatY),
    mulUniform = new CGL.Uniform(shader, "f", "mul", mul),
    maskUniform = new CGL.Uniform(shader, "t", "texMask", 1);

inMaskTex.onChange =
inMaskSource.onChange =
inMaskInv.onChange = () =>
{
    shader.toggleDefine("HAS_MASK", inMaskTex.isLinked());
    shader.toggleDefine("MASK_SRC_R", inMaskSource.get() == "R");
    shader.toggleDefine("MASK_SRC_G", inMaskSource.get() == "G");
    shader.toggleDefine("MASK_SRC_B", inMaskSource.get() == "B");
    shader.toggleDefine("MASK_SRC_A", inMaskSource.get() == "A");
    shader.toggleDefine("MASK_SRC_LUM", inMaskSource.get() == "Lum");
    shader.toggleDefine("MASK_INV", inMaskInv.get());
    inMaskSource.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
    inMaskInv.setUiAttribs({ "greyout": !inMaskTex.isLinked() });
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inMaskTex.get()) cgl.setTexture(1, inMaskTex.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.EdgeDetection_v4
// 
// **************************************************************

Ops.Gl.ImageCompose.EdgeDetection_v4= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"edgedetect_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\nUNI float width;\nUNI float strength;\nUNI float texWidth;\nUNI float texHeight;\nUNI float mulColor;\n\nconst vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);\n\nvec3 desaturate(vec3 color)\n{\n    return vec3(dot(vec3(0.2126,0.7152,0.0722), color));\n}\n\n{{CGL.BLENDMODES3}}\n\nvoid main()\n{\n    // vec4 col=vec4(1.0,0.0,0.0,1.0);\n\n    // float pixelX=0.27/texWidth;\n    // float pixelY=0.27/texHeight;\n    float pixelX=(width+0.01)*4.0/texWidth;\n    float pixelY=(width+0.01)*4.0/texHeight;\n\nvec2 tc=texCoord;\n// #ifdef OFFSETPIXEL\n    tc.x+=1.0/texWidth*0.5;\n    tc.y+=1.0/texHeight*0.5;\n// #endif\n    // col=texture(tex,texCoord);\n\n    float count=1.0;\n    vec4 base=texture(tex,texCoord);\n\n\tvec4 horizEdge = vec4( 0.0 );\n\thorizEdge -= texture( tex, vec2( tc.x - pixelX, tc.y - pixelY ) ) * 1.0;\n\thorizEdge -= texture( tex, vec2( tc.x - pixelX, tc.y     ) ) * 2.0;\n\thorizEdge -= texture( tex, vec2( tc.x - pixelX, tc.y + pixelY ) ) * 1.0;\n\thorizEdge += texture( tex, vec2( tc.x + pixelX, tc.y - pixelY ) ) * 1.0;\n\thorizEdge += texture( tex, vec2( tc.x + pixelX, tc.y     ) ) * 2.0;\n\thorizEdge += texture( tex, vec2( tc.x + pixelX, tc.y + pixelY ) ) * 1.0;\n\tvec4 vertEdge = vec4( 0.0 );\n\tvertEdge -= texture( tex, vec2( tc.x - pixelX, tc.y - pixelY ) ) * 1.0;\n\tvertEdge -= texture( tex, vec2( tc.x    , tc.y - pixelY ) ) * 2.0;\n\tvertEdge -= texture( tex, vec2( tc.x + pixelX, tc.y - pixelY ) ) * 1.0;\n\tvertEdge += texture( tex, vec2( tc.x - pixelX, tc.y + pixelY ) ) * 1.0;\n\tvertEdge += texture( tex, vec2( tc.x    , tc.y + pixelY ) ) * 2.0;\n\tvertEdge += texture( tex, vec2( tc.x + pixelX, tc.y + pixelY ) ) * 1.0;\n\n\thorizEdge*=base.a;\n\tvertEdge*=base.a;\n\n\n\tvec3 edge = sqrt((horizEdge.rgb/count * horizEdge.rgb/count) + (vertEdge.rgb/count * vertEdge.rgb/count));\n\n    edge=desaturate(edge);\n    edge*=strength;\n\n    if(mulColor>0.0) edge*=texture( tex, texCoord ).rgb*mulColor*4.0;\n    edge=max(min(edge,1.0),0.0);\n\n    //blend section\n    vec4 col=vec4(edge,base.a);\n\n    outColor=cgl_blendPixel(base,col,amount*base.a);\n}\n\n",};
const
    render = op.inTrigger("Render"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    strength = op.inFloat("Strength", 4.0),
    width = op.inValueSlider("Width", 0.1),
    mulColor = op.inValueSlider("Mul Color", 0),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.edgedetect_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    strengthUniform = new CGL.Uniform(shader, "f", "strength", strength),
    widthUniform = new CGL.Uniform(shader, "f", "width", width),
    uniWidth = new CGL.Uniform(shader, "f", "texWidth", 128),
    uniHeight = new CGL.Uniform(shader, "f", "texHeight", 128),
    uniMulColor = new CGL.Uniform(shader, "f", "mulColor", mulColor);

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount);

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    uniWidth.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().width);
    uniHeight.setValue(cgl.currentTextureEffect.getCurrentSourceTexture().height);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Cables.LoadingStatus_v2
// 
// **************************************************************

Ops.Cables.LoadingStatus_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    startTimeLine = op.inBool("Play Timeline", true),
    inConLog = op.inBool("Console Logging", false),
    next = op.outTrigger("Next"),
    outInitialFinished = op.outBoolNum("Finished Initial Loading", false),
    outLoading = op.outBoolNum("Loading"),
    outProgress = op.outNumber("Progress"),
    outList = op.outArray("Jobs"),
    loadingFinished = op.outTrigger("Trigger Loading Finished ");

op.toWorkPortsNeedToBeLinked(exe);
const patch = op.patch;
let finishedOnce = false;
const preRenderTimes = [];
let firstTime = true;
let timeout = 0;

document.body.classList.add("cables-loading");

let loadingId = patch.loading.start("loadingStatusInit", "loadingStatusInit", op);

op.patch.loading.on("finishedTask", updateStatus.bind(this));
op.patch.loading.on("startTask", updateStatus.bind(this));

inConLog.onChange = () =>
{
    op.patch.loading.consoleLog = inConLog.get();
};

function updateStatus()
{
    if (!exe.isLinked()) return;
    const jobs = op.patch.loading.getListJobs();
    outProgress.set(patch.loading.getProgress());

    let hasFinished = jobs.length === 0;
    const notFinished = !hasFinished;

    if (notFinished)
    {
        outList.set(op.patch.loading.getListJobs());
    }

    if (notFinished)
    {
        if (firstTime)
        {
            // if (preRenderOps.get()) op.patch.preRenderOps();

            op.patch.timer.setTime(0);
            if (startTimeLine.get())
            {
                op.patch.timer.play();
            }
            else
            {
                op.patch.timer.pause();
            }
        }
        firstTime = false;

        document.body.classList.remove("cables-loading");
        document.body.classList.add("cables-loaded");
    }
    else
    {
        finishedOnce = true;
        outList.set(op.patch.loading.getListJobs());
        if (patch.loading.getProgress() < 1.0)
        {
            op.patch.timer.setTime(0);
            op.patch.timer.pause();
        }
    }

    outInitialFinished.set(finishedOnce);

    if (outLoading.get() && hasFinished) loadingFinished.trigger();

    outLoading.set(notFinished);
    // clearTimeout(timeout);
    // if (notFinished) outLoading.set(notFinished);
    // else
    //     timeout = setTimeout(() =>
    //     {
    //         outLoading.set(notFinished);
    //     }, 100);

    op.setUiAttribs({ "loading": notFinished });
}

op.onDelete = () =>
{
    if (loadingId)
    {
        patch.loading.finished(loadingId);
        loadingId = null;
    }
};

exe.onTriggered = () =>
{
    updateStatus();

    next.trigger();

    if (loadingId)
    {
        patch.loading.finished(loadingId);
        loadingId = null;
    }
};

}
};






// **************************************************************
// 
// Ops.Anim.BoolAnim
// 
// **************************************************************

Ops.Anim.BoolAnim= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const anim = new CABLES.Anim();

const
    exe = op.inTrigger("exe"),
    bool = op.inValueBool("bool"),
    pease = anim.createPort(op, "easing"),
    duration = op.inValue("duration", 0.25),
    dir = op.inValueSelect("Direction", ["Both", "Only True", "Only False"], "Both"),
    valueFalse = op.inValue("value false", 0),
    valueTrue = op.inValue("value true", 1),
    next = op.outTrigger("trigger"),
    value = op.outNumber("value"),
    finished = op.outBoolNum("finished"),
    finishedTrigger = op.outTrigger("Finished Trigger");

const startTime = CABLES.now();
op.toWorkPortsNeedToBeLinked(exe);
op.setPortGroup("Animation", [duration, pease]);
op.setPortGroup("Values", [valueFalse, valueTrue]);

dir.onChange = bool.onChange = valueFalse.onChange = valueTrue.onChange = duration.onChange = setAnim;
setAnim();

function setAnim()
{
    if (dir.get() == "Animate Both")dir.set("Both");
    finished.set(false);
    const now = (CABLES.now() - startTime) / 1000;
    const oldValue = anim.getValue(now);
    anim.clear();

    anim.setValue(now, oldValue);

    if (!bool.get())
    {
        if (dir.get() != "Only True") anim.setValue(now + duration.get(), valueFalse.get());
        else anim.setValue(now, valueFalse.get());
    }
    else
    {
        if (dir.get() != "Only False") anim.setValue(now + duration.get(), valueTrue.get());
        else anim.setValue(now, valueTrue.get());
    }
}

exe.onTriggered = function ()
{
    const t = (CABLES.now() - startTime) / 1000;
    value.set(anim.getValue(t));

    if (anim.hasEnded(t))
    {
        if (!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }

    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Desaturate
// 
// **************************************************************

Ops.Gl.ImageCompose.Desaturate= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"desaturate_frag":"\nIN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\n\n#ifdef MASK\n    UNI sampler2D mask;\n#endif\n\nvec3 desaturate(vec3 color, float amount)\n{\n   vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));\n   return vec3(mix(color, gray, amount));\n}\n\nvoid main()\n{\n    vec4 col=texture(tex,texCoord);\n\n    float am=amount;\n    #ifdef MASK\n        am*=1.0-texture(mask,texCoord).r;\n        #ifdef INVERTMASK\n        am=1.0-am;\n        #endif\n    #endif\n\n    col.rgb=desaturate(col.rgb,am);\n    outColor= col;\n}",};
const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const amount = op.inValueSlider("amount", 1);
const inMask = op.inTexture("Mask");
const invertMask = op.inValueBool("Invert Mask");

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.desaturate_frag);
let textureUniform = new CGL.Uniform(shader, "t", "tex", 0);
let masktextureUniform = new CGL.Uniform(shader, "t", "mask", 1);
let amountUniform = new CGL.Uniform(shader, "f", "amount", amount);

invertMask.onChange = function ()
{
    if (invertMask.get())shader.define("INVERTMASK");
    else shader.removeDefine("INVERTMASK");
};

inMask.onChange = function ()
{
    if (inMask.get())shader.define("MASK");
    else shader.removeDefine("MASK");
};

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);

    if (inMask.get()) cgl.setTexture(1, inMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Boolean.BoolToNumber_v2
// 
// **************************************************************

Ops.Boolean.BoolToNumber_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    useValue1Port = op.inBool("Use Value 1", false),
    value0port = op.inFloat("Value 0", 0),
    value1port = op.inFloat("Value 1", 1),
    outValuePort = op.outNumber("Out Value", 0);

value0port.onChange =
    value1port.onChange =
    useValue1Port.onChange = setOutput;

function setOutput()
{
    const useValue1 = useValue1Port.get();

    if (useValue1)
    {
        outValuePort.set(value1port.get());
    }
    else
    {
        outValuePort.set(value0port.get());
    }
}

}
};






// **************************************************************
// 
// Ops.Gl.MainLoop_v2
// 
// **************************************************************

Ops.Gl.MainLoop_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    hdpi = op.inFloat("Max Pixel Density (DPR)", 2),
    fpsLimit = op.inValue("FPS Limit", 0),
    reduceFocusFPS = op.inValueBool("Reduce FPS unfocussed", false),
    clear = op.inValueBool("Transparent", false),
    active = op.inValueBool("Active", 1),
    inFocus = op.inValueBool("Focus canvas", 1),
    trigger = op.outTrigger("trigger"),
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    outPixel = op.outNumber("Pixel Density");

op.onAnimFrame = render;
hdpi.onChange = updateHdpi;

const cgl = op.patch.cg = op.patch.cgl;
let rframes = 0;
let rframeStart = 0;
let timeOutTest = null;
let addedListener = false;
if (!op.patch.cgl) op.uiAttr({ "error": "No webgl cgl context" });

const identTranslate = vec3.create();
vec3.set(identTranslate, 0, 0, 0);
const identTranslateView = vec3.create();
vec3.set(identTranslateView, 0, 0, -2);

let firstTime = true;
let fsElement = null;
let winhasFocus = true;
let winVisible = true;
let lastFrame = -1;
let duplicate = 0;
window.addEventListener("blur", () => { winhasFocus = false; });
window.addEventListener("focus", () => { winhasFocus = true; });
document.addEventListener("visibilitychange", () => { winVisible = !document.hidden; });
if (CABLES.UI)gui.canvasManager.addCgContext(op.patch.cgl);

testMultiMainloop();

// op.patch.cgl.cgCanvas.forceAspect = 1.7777777;
op.patch.tempData.mainloopOp = this;

op.patch.cgl.canvas.classList.add("cablescontext");
op.patch.cgl.canvas.dataset.contextname = "cgl";
op.patch.cgl.canvas.dataset.api = "webgl";

if (CABLES.UI)gui.setLayout();

function updateHdpi()
{
    setPixelDensity();

    if (CABLES.UI)
    {
        if (hdpi.get() < 1)
            op.patch.cgl.canvas.style.imageRendering = "pixelated";
    }

    op.patch.cgl.updateSize();
    if (CABLES.UI) gui.setLayout();
}

active.onChange = function ()
{
    op.patch.removeOnAnimFrame(op);

    if (active.get())
    {
        op.setUiAttrib({ "extendTitle": "" });
        op.onAnimFrame = render;
        op.patch.addOnAnimFrame(op);
        op.log("adding again!");
    }
    else
    {
        op.setUiAttrib({ "extendTitle": "Inactive" });
    }
};

function getFpsLimit()
{
    if (reduceFocusFPS.get())
    {
        if (!winVisible) return 10;
        if (!winhasFocus) return 30;
    }

    return fpsLimit.get();
}

op.onDelete = function ()
{
    cgl.gl.clearColor(0, 0, 0.0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
};

function setPixelDensity()
{
    if (hdpi.get() != 0) op.patch.cgl.pixelDensity = Math.min(hdpi.get(), window.devicePixelRatio);
    else op.patch.cgl.pixelDensity = window.devicePixelRatio;
}

function render(time, frame, delta)
{
    if (frame === lastFrame)
    {
        if (duplicate < 10)console.warn("duplicate frame?!");
        duplicate++;
        return;
    }
    lastFrame = frame;

    if (!active.get()) return;
    if (cgl.aborted || cgl.canvas.clientWidth === 0 || cgl.canvas.clientHeight === 0) return;

    op.patch.cg = cgl;

    setPixelDensity();

    // if (hdpi.get())op.patch.cgl.pixelDensity = window.devicePixelRatio;

    const startTime = performance.now();

    op.patch.config.fpsLimit = getFpsLimit();

    if (cgl.canvasWidth == -1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if (cgl.canvasWidth != width.get() || cgl.canvasHeight != height.get())
    {
        width.set(cgl.canvasWidth / 1);
        height.set(cgl.canvasHeight / 1);
    }

    if (CABLES.now() - rframeStart > 1000)
    {
        CGL.fpsReport = CGL.fpsReport || [];
        if (op.patch.loading.getProgress() >= 1.0 && rframeStart !== 0)CGL.fpsReport.push(rframes);
        rframes = 0;
        rframeStart = CABLES.now();
    }
    cgl.lastShader = null;
    cgl.lastMesh = null;

    cgl.renderStart(cgl, identTranslate, identTranslateView);

    if (!clear.get()) cgl.gl.clearColor(0, 0, 0, 1);
    else cgl.gl.clearColor(0, 0, 0, 0);

    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    trigger.trigger();

    if (cgl.lastMesh)cgl.lastMesh.unBind();

    if (CGL.Texture.previewTexture)
    {
        if (!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer = new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);

    op.patch.cg = null;

    if (!clear.get())
    {
        cgl.gl.clearColor(1, 1, 1, 1);
        cgl.gl.colorMask(false, false, false, true);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        cgl.gl.colorMask(true, true, true, true);
    }

    if (!cgl.tempData.phong)cgl.tempData.phong = {};
    rframes++;
    if (firstTime)
    {
        if (inFocus.get()) cgl.canvas.focus();
        firstTime = false;
    }

    outPixel.set(op.patch.cgl.pixelDensity);
    op.patch.cgl.profileData.profileMainloopMs = performance.now() - startTime;
}

function testMultiMainloop()
{
    clearTimeout(timeOutTest);
    timeOutTest = setTimeout(
        () =>
        {
            if (op.patch.getOpsByObjName(op.name).length > 1)
            {
                op.setUiError("multimainloop", "there should only be one mainloop op!");
                if (!addedListener)addedListener = op.patch.addEventListener("onOpDelete", testMultiMainloop);
            }
            else op.setUiError("multimainloop", null, 1);
        }, 500);
}

}
};






// **************************************************************
// 
// Ops.Graphics.OrbitControls_v3
// 
// **************************************************************

Ops.Graphics.OrbitControls_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    render = op.inTrigger("render"),
    minDist = op.inValueFloat("min distance", 1),
    maxDist = op.inValueFloat("max distance", 999999),

    minRotY = op.inValue("min rot y", 0),
    maxRotY = op.inValue("max rot y", 0),

    initialRadius = op.inValue("initial radius", 2),
    initialAxis = op.inValueSlider("initial axis y", 0.5),
    initialX = op.inValueSlider("initial axis x", 0.25),

    smoothness = op.inValueSlider("Smoothness", 1.0),
    speedX = op.inValue("Speed X", 1),
    speedY = op.inValue("Speed Y", 1),

    active = op.inValueBool("Active", true),

    allowPanning = op.inValueBool("Allow Panning", true),
    allowZooming = op.inValueBool("Allow Zooming", true),
    allowRotation = op.inValueBool("Allow Rotation", true),
    restricted = op.inValueBool("restricted", true),
    inIdentity = op.inBool("Identity", true),
    inReset = op.inTriggerButton("Reset"),

    trigger = op.outTrigger("trigger"),
    outRadius = op.outNumber("radius"),
    outXDeg = op.outNumber("Rot X"),
    outYDeg = op.outNumber("Rot Y");
    // outCoords = op.outArray("Eye/Target Pos");

op.setPortGroup("Initial Values", [initialAxis, initialX, initialRadius]);
op.setPortGroup("Interaction", [smoothness, speedX, speedY]);
op.setPortGroup("Boundaries", [minRotY, maxRotY, minDist, maxDist]);

const halfCircle = Math.PI;
const fullCircle = Math.PI * 2;

const
    vUp = vec3.create(),
    vCenter = vec3.create(),
    viewMatrix = mat4.create(),
    tempViewMatrix = mat4.create(),
    vOffset = vec3.create(),
    finalEyeAbs = vec3.create(),
    tempEye = vec3.create(),
    finalEye = vec3.create(),
    tempCenter = vec3.create(),
    finalCenter = vec3.create();

let eye = vec3.create(),
    mouseDown = false,
    radius = 5,
    lastMouseX = 0, lastMouseY = 0,
    percX = 0, percY = 0,
    px = 0,
    py = 0,
    divisor = 1,
    element = null,
    initializing = true,
    eyeTargetCoord = [0, 0, 0, 0, 0, 0],
    lastPy = 0;

op.onDelete = unbind;
smoothness.onChange = updateSmoothness;
initialRadius.onChange =
    inReset.onTriggered = reset;

eye = circlePos(0);
vec3.set(vCenter, 0, 0, 0);
vec3.set(vUp, 0, 1, 0);
updateSmoothness();
reset();

function reset()
{
    let off = 0;

    if (px % fullCircle < -halfCircle)
    {
        off = -fullCircle;
        px %= -fullCircle;
    }
    else
    if (px % fullCircle > halfCircle)
    {
        off = fullCircle;
        px %= fullCircle;
    }
    else px %= fullCircle;

    py %= (Math.PI);

    vec3.set(vOffset, 0, 0, 0);
    vec3.set(vCenter, 0, 0, 0);
    vec3.set(vUp, 0, 1, 0);

    percX = (initialX.get() * Math.PI * 2 + off);
    percY = (initialAxis.get() - 0.5);

    radius = initialRadius.get();
    eye = circlePos(percY);
}

function updateSmoothness()
{
    divisor = smoothness.get() * 10 + 1;
}

function ip(val, goal)
{
    if (initializing) return goal;
    return val + (goal - val) / divisor;
}

render.onTriggered = function ()
{
    const cgl = op.patch.cg;
    if (!cgl) return;

    if (!element)
    {
        setElement(cgl.canvas);
        bind();
    }

    cgl.pushViewMatrix();

    px = ip(px, percX);
    py = ip(py, percY);

    let degY = (py + 0.5) * 180;

    if (minRotY.get() !== 0 && degY < minRotY.get())
    {
        degY = minRotY.get();
        py = lastPy;
    }
    else if (maxRotY.get() !== 0 && degY > maxRotY.get())
    {
        degY = maxRotY.get();
        py = lastPy;
    }
    else
    {
        lastPy = py;
    }

    const degX = (px) * CGL.RAD2DEG;

    outYDeg.set(degY);
    outXDeg.set(degX);

    circlePosi(eye, py);

    vec3.add(tempEye, eye, vOffset);
    vec3.add(tempCenter, vCenter, vOffset);

    finalEye[0] = ip(finalEye[0], tempEye[0]);
    finalEye[1] = ip(finalEye[1], tempEye[1]);
    finalEye[2] = ip(finalEye[2], tempEye[2]);

    finalCenter[0] = ip(finalCenter[0], tempCenter[0]);
    finalCenter[1] = ip(finalCenter[1], tempCenter[1]);
    finalCenter[2] = ip(finalCenter[2], tempCenter[2]);

    // eyeTargetCoord[0] = finalEye[0];
    // eyeTargetCoord[1] = finalEye[1];
    // eyeTargetCoord[2] = finalEye[2];
    // eyeTargetCoord[3] = finalCenter[0];
    // eyeTargetCoord[4] = finalCenter[1];
    // eyeTargetCoord[5] = finalCenter[2];
    // outCoords.setRef(eyeTargetCoord);

    const empty = vec3.create();

    if (inIdentity.get()) mat4.identity(cgl.vMatrix);

    mat4.lookAt(viewMatrix, finalEye, finalCenter, vUp);
    mat4.rotate(viewMatrix, viewMatrix, px, vUp);

    // finaly multiply current scene viewmatrix
    mat4.multiply(cgl.vMatrix, cgl.vMatrix, viewMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
    initializing = false;
};

function circlePosi(vec, perc)
{
    if (radius < minDist.get()) radius = minDist.get();
    if (radius > maxDist.get()) radius = maxDist.get();

    outRadius.set(radius);

    let i = 0, degInRad = 0;

    degInRad = 360 * perc / 2 * CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad) * radius,
        Math.sin(degInRad) * radius,
        0);
    return vec;
}

function circlePos(perc)
{
    if (radius < minDist.get())radius = minDist.get();
    if (radius > maxDist.get())radius = maxDist.get();

    outRadius.set(radius);

    let i = 0, degInRad = 0;
    const vec = vec3.create();
    degInRad = 360 * perc / 2 * CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad) * radius,
        Math.sin(degInRad) * radius,
        0);
    return vec;
}

function onmousemove(event)
{
    if (!mouseDown) return;

    const x = event.clientX;
    const y = event.clientY;

    let movementX = (x - lastMouseX);
    let movementY = (y - lastMouseY);

    movementX *= speedX.get();
    movementY *= speedY.get();

    if (event.buttons == 2 && allowPanning.get())
    {
        vOffset[2] += movementX * 0.01;
        vOffset[1] += movementY * 0.01;
    }
    else
    if (event.buttons == 4 && allowZooming.get())
    {
        radius += movementY * 0.05;
        eye = circlePos(percY);
    }
    else
    {
        if (allowRotation.get())
        {
            percX += movementX * 0.003;
            percY += movementY * 0.002;

            if (restricted.get())
            {
                if (percY > 0.5)percY = 0.5;
                if (percY < -0.5)percY = -0.5;
            }
        }
    }

    lastMouseX = x;
    lastMouseY = y;
}

function onMouseDown(event)
{
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown = true;

    try { element.setPointerCapture(event.pointerId); }
    catch (e) {}
}

function onMouseUp(e)
{
    mouseDown = false;

    try { element.releasePointerCapture(e.pointerId); }
    catch (e) {}
}

function lockChange()
{
    const el = op.patch.cg.canvas;

    if (document.pointerLockElement === el || document.mozPointerLockElement === el || document.webkitPointerLockElement === el)
        document.addEventListener("mousemove", onmousemove, false);
}

function onMouseEnter(e)
{
}

initialX.onChange = function ()
{
    px = percX = (initialX.get() * Math.PI * 2);
};

initialAxis.onChange = function ()
{
    py = percY = (initialAxis.get() - 0.5);
    eye = circlePos(percY);
};

const onMouseWheel = function (event)
{
    if (allowZooming.get())
    {
        const delta = CGL.getWheelSpeed(event) * 0.06;
        radius += (parseFloat(delta)) * 1.2;
        eye = circlePos(percY);
    }
};

const ontouchstart = function (event)
{
    if (event.touches && event.touches.length > 0) onMouseDown(event.touches[0]);
};

const ontouchend = function (event)
{
    onMouseUp();
};

const ontouchmove = function (event)
{
    if (event.touches && event.touches.length > 0) onmousemove(event.touches[0]);
};

active.onChange = function ()
{
    if (active.get())bind();
    else unbind();
};

function setElement(ele)
{
    unbind();
    element = ele;
    bind();
}

function bind()
{
    if (!element) return;
    if (!active.get()) return unbind();

    element.addEventListener("pointermove", onmousemove);
    element.addEventListener("pointerdown", onMouseDown);
    element.addEventListener("pointerup", onMouseUp);
    element.addEventListener("pointerleave", onMouseUp);
    element.addEventListener("pointerenter", onMouseEnter);
    element.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    element.addEventListener("wheel", onMouseWheel, { "passive": true });
}

function unbind()
{
    if (!element) return;

    element.removeEventListener("pointermove", onmousemove);
    element.removeEventListener("pointerdown", onMouseDown);
    element.removeEventListener("pointerup", onMouseUp);
    element.removeEventListener("pointerleave", onMouseUp);
    element.removeEventListener("pointerenter", onMouseUp);
    element.removeEventListener("wheel", onMouseWheel);
}

}
};






// **************************************************************
// 
// Ops.Gl.Matrix.Camera_v2
// 
// **************************************************************

Ops.Gl.Matrix.Camera_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const render = op.inTrigger("render");
const trigger = op.outTrigger("trigger");
const inIdentity = op.inBool("Identity", true);
/* Inputs */
// projection | prespective & ortogonal
const projectionMode = op.inValueSelect("projection mode", ["prespective", "ortogonal"], "prespective");
const zNear = op.inValue("frustum near", 0.01);
const zFar = op.inValue("frustum far", 5000.0);

const fov = op.inValue("fov", 45);
const autoAspect = op.inValueBool("Auto Aspect Ratio", true);
const aspect = op.inValue("Aspect Ratio", 1);

// look at camera
const eyeX = op.inValue("eye X", 0);
const eyeY = op.inValue("eye Y", 0);
const eyeZ = op.inValue("eye Z", 5);

const centerX = op.inValue("center X", 0);
const centerY = op.inValue("center Y", 0);
const centerZ = op.inValue("center Z", 0);

// camera transform and movements
const posX = op.inValue("truck", 0);
const posY = op.inValue("boom", 0);
const posZ = op.inValue("dolly", 0);

const rotX = op.inValue("tilt", 0);
const rotY = op.inValue("pan", 0);
const rotZ = op.inValue("roll", 0);

/* Outputs */
const outAsp = op.outNumber("Aspect");
const outArr = op.outArray("Look At Array");

/* logic */
const cgl = op.patch.cgl;

let asp = 0;

const vUp = vec3.create();
const vEye = vec3.create();
const vCenter = vec3.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);

const arr = [];

// Transform and move
const vPos = vec3.create();
const transMatrixMove = mat4.create();
mat4.identity(transMatrixMove);

let updateCameraMovementMatrix = true;

render.onTriggered = function ()
{
    if (cgl.tempData.shadowPass) return trigger.trigger();

    // Aspect ration
    if (!autoAspect.get()) asp = aspect.get();
    else asp = cgl.getViewPort()[2] / cgl.getViewPort()[3];
    outAsp.set(asp);

    // translation (truck, boom, dolly)
    cgl.pushViewMatrix();

    if (inIdentity.get())mat4.identity(cgl.vMatrix);

    if (updateCameraMovementMatrix)
    {
        mat4.identity(transMatrixMove);

        vec3.set(vPos, posX.get(), posY.get(), posZ.get());
        if (posX.get() !== 0.0 || posY.get() !== 0.0 || posZ.get() !== 0.0)
            mat4.translate(transMatrixMove, transMatrixMove, vPos);

        if (rotX.get() !== 0)
            mat4.rotateX(transMatrixMove, transMatrixMove, rotX.get() * CGL.DEG2RAD);
        if (rotY.get() !== 0)
            mat4.rotateY(transMatrixMove, transMatrixMove, rotY.get() * CGL.DEG2RAD);
        if (rotZ.get() !== 0)
            mat4.rotateZ(transMatrixMove, transMatrixMove, rotZ.get() * CGL.DEG2RAD);

        updateCameraMovementMatrix = false;
    }

    mat4.multiply(cgl.vMatrix, cgl.vMatrix, transMatrixMove);

    // projection (prespective / ortogonal)
    cgl.pushPMatrix();

    // look at
    cgl.pushViewMatrix();

    if (projectionMode.get() == "prespective")
    {
        mat4.perspective(
            cgl.pMatrix,
            fov.get() * 0.0174533,
            asp,
            zNear.get(),
            zFar.get()
        );
    }
    else if (projectionMode.get() == "ortogonal")
    {
        mat4.ortho(
            cgl.pMatrix,
            -1 * (fov.get() / 14),
            1 * (fov.get() / 14),
            -1 * (fov.get() / 14) / asp,
            1 * (fov.get() / 14) / asp,
            zNear.get(),
            zFar.get()
        );
    }

    arr[0] = eyeX.get();
    arr[1] = eyeY.get();
    arr[2] = eyeZ.get();

    arr[3] = centerX.get();
    arr[4] = centerY.get();
    arr[5] = centerZ.get();

    arr[6] = 0;
    arr[7] = 1;
    arr[8] = 0;

    outArr.setRef(arr);

    vec3.set(vUp, 0, 1, 0);
    vec3.set(vEye, eyeX.get(), eyeY.get(), eyeZ.get());
    vec3.set(vCenter, centerX.get(), centerY.get(), centerZ.get());

    mat4.lookAt(transMatrix, vEye, vCenter, vUp);

    mat4.multiply(cgl.vMatrix, cgl.vMatrix, transMatrix);

    trigger.trigger();

    cgl.popViewMatrix();
    cgl.popPMatrix();

    cgl.popViewMatrix();

    // GUI for dolly, boom and truck
    if (op.isCurrentUiOp())
        gui.setTransformGizmo({
            "posX": posX,
            "posY": posY,
            "posZ": posZ
        });
};

const updateUI = function ()
{
    if (!autoAspect.get())
    {
        aspect.setUiAttribs({ "greyout": false });
    }
    else
    {
        aspect.setUiAttribs({ "greyout": true });
    }
};

const cameraMovementChanged = function ()
{
    updateCameraMovementMatrix = true;
};

// listeners
posX.onChange = cameraMovementChanged;
posY.onChange = cameraMovementChanged;
posZ.onChange = cameraMovementChanged;

rotX.onChange = cameraMovementChanged;
rotY.onChange = cameraMovementChanged;
rotZ.onChange = cameraMovementChanged;

autoAspect.onChange = updateUI;
updateUI();

}
};






// **************************************************************
// 
// Ops.Gl.Meshes.PointCloudFromArray_v2
// 
// **************************************************************

Ops.Gl.Meshes.PointCloudFromArray_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    arr = op.inArray("Array", 3),
    numPoints = op.inValueInt("Num Points"),
    outTrigger = op.outTrigger("Trigger out"),
    outGeom = op.outObject("Geometry"),
    pTexCoordRand = op.inValueBool("Scramble Texcoords", true),
    seed = op.inValue("Seed", 1),
    inCoords = op.inArray("Coordinates", 2),
    inPointSizes = op.inArray("Point sizes", 1),
    vertCols = op.inArray("Vertex Colors", 4);

op.toWorkPortsNeedToBeLinked(arr, exe);
op.setPortGroup("Texture Coordinates", [pTexCoordRand, seed, inCoords]);

const cgl = op.patch.cgl;
const geom = new CGL.Geometry("pointcloudfromarray");
let deactivated = false;
let mesh = null;
let texCoords = [];
let needsRebuild = true;
let showingError = false;

arr.setUiAttribs({ "title": "Positions" });
inCoords.setUiAttribs({ "title": "Texture Coordinates" });

op.onDelete = disposeMesh;

inCoords.onChange =
    pTexCoordRand.onChange = updateTexCoordsPorts;
vertCols.onChange = updateVertCols;
numPoints.onChange = updateNumVerts;
inPointSizes.onChange = updatePointSizes;

seed.onChange =
    arr.onChange =
    vertCols.onLinkChanged =
    inPointSizes.onLinkChanged = reset;

exe.onTriggered = doRender;

function doRender()
{
    let shader = cgl.getShader();
    op.checkGraphicsApi();

    if (CABLES.UI && shader)
    {
        if (shader.glPrimitive != cgl.gl.POINTS) op.setUiError("nopointmat", "Using a Material not made for point rendering. Try to use PointMaterial.");
        else op.setUiError("nopointmat", null);
    }

    if (needsRebuild || !mesh) rebuild();
    if (!deactivated && mesh) mesh.render(shader);
    outTrigger.trigger();
}

function reset()
{
    deactivated = arr.get() == null;

    if (!deactivated)needsRebuild = true;
    else needsRebuild = false;
}

function updateTexCoordsPorts()
{
    if (inCoords.isLinked())
    {
        seed.setUiAttribs({ "greyout": true });
        pTexCoordRand.setUiAttribs({ "greyout": true });
    }
    else
    {
        pTexCoordRand.setUiAttribs({ "greyout": false });

        if (!pTexCoordRand.get()) seed.setUiAttribs({ "greyout": true });
        else seed.setUiAttribs({ "greyout": false });
    }

    disposeMesh();
    needsRebuild = true;
}

function updatePointSizes()
{
    if (!inPointSizes.get()) return;

    if (!geom.getAttribute("attrPointSize")) reset();

    if (mesh)mesh.setAttribute("attrPointSize", inPointSizes.get(), 1);
}

function updateVertCols()
{
    needsRebuild = true;
}

function updateNumVerts()
{
    if (mesh)
    {
        mesh.setNumIndices(Math.min(geom.vertices.length / 3, numPoints.get()));
        if (numPoints.get() == 0)mesh.setNumIndices(geom.vertices.length / 3);
    }
}

function disposeMesh()
{
    if (mesh)mesh.dispose();
    mesh = null;
}

function rebuild()
{
    let verts = arr.get() || [];

    if (verts.length % 3 !== 0)
    {
        op.setUiError("div3", "Array length not multiple of 3");

        return;
    }
    else op.setUiError("div3", null);

    if (geom.vertices.length == verts.length && mesh && !inCoords.isLinked() && !vertCols.isLinked() && !geom.getAttribute("attrPointSize"))
    {
        mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, verts, 3);
        geom.vertices = verts;
        needsRebuild = false;

        return;
    }

    // if (geom.getAttribute("attrPointSize" && inPointSizes.isLinked())) changed = true;

    geom.clear();
    let num = verts.length / 3;
    num = Math.abs(Math.floor(num));

    if (num == 0) return;

    if (!texCoords || texCoords.length != num * 2) texCoords = new Float32Array(num * 2); // num*2;//=

    let rndTc = pTexCoordRand.get();

    if (!inCoords.isLinked())
    {
        Math.randomSeed = seed.get();
        texCoords = []; // needed otherwise its using the reference to input incoords port

        for (let i = 0; i < num; i++)
        {
            if (geom.vertices[i * 3] != verts[i * 3] ||
                geom.vertices[i * 3 + 1] != verts[i * 3 + 1] ||
                geom.vertices[i * 3 + 2] != verts[i * 3 + 2])
            {
                if (rndTc)
                {
                    texCoords[i * 2] = Math.seededRandom();
                    texCoords[i * 2 + 1] = Math.seededRandom();
                }
                else
                {
                    texCoords[i * 2] = i / num;
                    texCoords[i * 2 + 1] = i / num;
                }
            }
        }
    }

    if (vertCols.get())
    {
        if (vertCols.get().length != num * 4)
        {
            op.setUiError("vertColWrongLength", "Color array does not have the correct length! (should be " + num * 4 + ")");

            disposeMesh();
            return;
        }
        else op.setUiError("vertColWrongLength", null);

        geom.vertexColors = vertCols.get();
    }
    else
    {
        op.setUiError("vertColWrongLength", null);
        geom.vertexColors = [];
    }

    if (inPointSizes.get())
    {
        if (inPointSizes.get().length != num)
        {
            op.setUiError("pointsizeWrongLength", "Color array does not have the correct length! (should be " + num + ")");
            disposeMesh();
            return;
        }
        else op.setUiError("pointsizeWrongLength", null);

        geom.setAttribute("attrPointSize", inPointSizes.get(), 1);
    }
    else
    {
        op.setUiError("pointsizeWrongLength", null);
        geom.setAttribute("attrPointSize", [], 1);
    }

    if (inCoords.isLinked()) texCoords = inCoords.get();

    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);

    if (!mesh)mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);

    outGeom.setRef(geom);

    updateNumVerts();
    needsRebuild = false;
}

}
};






// **************************************************************
// 
// Ops.Gl.Shader.PointMaterial_v6
// 
// **************************************************************

Ops.Gl.Shader.PointMaterial_v6= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"pointmat_frag":"\n{{MODULES_HEAD}}\n\nUNI vec4 color;\nUNI float atlasNumX;\n\n// IN vec2 pointCoord;\nIN float ps;\nIN vec2 texCoord;\n\n#ifdef HAS_TEXTURE_DIFFUSE\n    UNI sampler2D diffTex;\n#endif\n#ifdef HAS_TEXTURE_MASK\n    UNI sampler2D texMask;\n#endif\n#ifdef HAS_TEXTURE_COLORIZE\n    IN vec4 colorize;\n#endif\n#ifdef HAS_TEXTURE_OPACITY\n    IN float opacity;\n#endif\n\n#ifdef HAS_TEXTURE_ROT\n    UNI sampler2D texRot;\n#endif\n\n\n#ifdef USE_ATLAS\n    IN float randAtlas;\n    #ifdef HAS_TEXTURE_ATLASLOOKUP\n        UNI sampler2D texAtlasLookup;\n    #endif\n#endif\n\n\n#ifdef VERTEX_COLORS\n    IN vec4 vertexColor;\n#endif\n\nvec3 lumcoeff = vec3(0.299,0.587,0.114);\n\n#define PI 3.14159265\n#define TAU (2.0*PI)\n\nvoid pR(inout vec2 p, float a)\n{\n\tp = cos(a)*p + sin(a)*vec2(p.y, -p.x);\n}\n\n\nvoid main()\n{\n    #ifdef FLIP_TEX\n        vec2 pointCoord=vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y));\n    #endif\n    #ifndef FLIP_TEX\n        vec2 pointCoord=gl_PointCoord;\n    #endif\n\n    #ifdef HAS_TEXTURE_ROT\n        float r=texture(texRot,texCoord).r;\n        pointCoord-=vec2(0.5);\n        pR(pointCoord,r*TAU);\n        pointCoord+=vec2(0.5);\n    #endif\n\n    vec2 origPointCoord=pointCoord;\n\n\n    #ifdef USE_ATLAS\n\n        float atlasIdx=randAtlas;\n\n        #ifdef HAS_TEXTURE_ATLASLOOKUP\n            atlasIdx=texture(texAtlasLookup,texCoord).r;\n        #endif\n\n        float anx=min(0.0001,atlasNumX);\n        #ifdef ATLAS_XFADE\n            vec2 pointCoord2=vec2(origPointCoord);\n            pointCoord2.x=origPointCoord.x/anx+ceil(atlasIdx)*(1.0/anx);\n        #endif\n\n        pointCoord.x=origPointCoord.x/anx+floor(atlasIdx)*(1.0/anx);\n\n\n    #endif\n\n    {{MODULE_BEGIN_FRAG}}\n\n    if(ps<1.0)discard;\n\n    vec4 col=color;\n\n    #ifdef HAS_TEXTURE_MASK\n        float mask;\n        #ifdef TEXTURE_MASK_R\n            mask=texture(texMask,pointCoord).r;\n        #endif\n        #ifdef TEXTURE_MASK_A\n            mask=texture(texMask,pointCoord).a;\n        #endif\n        #ifdef TEXTURE_MASK_LUMI\n        \tmask = dot(texture(texMask,pointCoord).rgb, lumcoeff);\n        #endif\n\n        #ifdef USE_ATLAS\n            #ifdef ATLAS_XFADE\n                float mask2=texture(texMask,pointCoord2).r;\n\n                #ifdef TEXTURE_MASK_A\n                    mask2=texture(texMask,pointCoord2).a;\n                #endif\n                #ifdef TEXTURE_MASK_LUMI\n                \tmask2 = dot(texture(texMask,pointCoord2).rgb, lumcoeff);\n                #endif\n\n                mask=mix(mask,mask2,fract(atlasIdx));\n            #endif\n        #endif\n    #endif\n\n    #ifdef HAS_TEXTURE_DIFFUSE\n\n        col=texture(diffTex,pointCoord);\n\n        #ifdef USE_ATLAS\n            #ifdef ATLAS_XFADE\n                vec4 col2=texture(diffTex,pointCoord2);\n                col=mix(col,col2,fract(atlasIdx));\n            #endif\n        #endif\n\n        #ifdef COLORIZE_TEXTURE\n            col.rgb*=color.rgb;\n        #endif\n    #endif\n\n    col.a*=color.a;\n\n\n    #ifdef MAKE_ROUND\n\n        #ifndef MAKE_ROUNDAA\n            if ((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5) > 0.25) discard; //col.a=0.0;\n        #endif\n\n        #ifdef MAKE_ROUNDAA\n            float circ=(gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5);\n\n            float a=smoothstep(0.25,0.25-fwidth(gl_PointCoord.x),circ);\n            if(a==0.0)discard;\n            col.a=a*color.a;\n        #endif\n    #endif\n\n    #ifdef HAS_TEXTURE_COLORIZE\n        col*=colorize;\n    #endif\n\n    #ifdef TEXTURE_COLORIZE_MUL\n        col*=color;\n    #endif\n\n    #ifdef HAS_TEXTURE_MASK\n        col.a*=mask;\n    #endif\n\n    #ifdef HAS_TEXTURE_OPACITY\n        col.a*=opacity;\n    #endif\n\n    #ifdef VERTEX_COLORS\n        col.rgb = vertexColor.rgb;\n        col.a *= vertexColor.a;\n    #endif\n\n    if (col.a <= 0.0) discard;\n\n    #ifdef HAS_TEXTURE_COLORIZE\n        col*=colorize;\n    #endif\n\n    {{MODULE_COLOR}}\n\n\n    outColor = col;\n}\n","pointmat_vert":"{{MODULES_HEAD}}\n\nIN vec3 vPosition;\nIN vec2 attrTexCoord;\nIN vec3 attrVertNormal;\nIN vec3 attrTangent;\nIN vec3 attrBiTangent;\nIN float attrPointSize;\n\n#ifdef VERTEX_COLORS\n    IN vec4 attrVertColor;\n    OUT vec4 vertexColor;\n#endif\n\nOUT vec3 norm;\nOUT float ps;\nOUT vec2 texCoord;\n\n#ifdef HAS_TEXTURES\n#endif\n\n#ifdef HAS_TEXTURE_COLORIZE\n   UNI sampler2D texColorize;\n   OUT vec4 colorize;\n#endif\n#ifdef HAS_TEXTURE_OPACITY\n    UNI sampler2D texOpacity;\n    OUT float opacity;\n#endif\n#ifdef HAS_TEXTURE_POINTSIZE\n   UNI sampler2D texPointSize;\n   UNI float texPointSizeMul;\n#endif\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\nUNI float pointSize;\nUNI vec3 camPos;\n\nUNI float canvasWidth;\nUNI float canvasHeight;\nUNI float camDistMul;\nUNI float randomSize;\nUNI float minPointSize;\nUNI float pixelRatio;\n\nIN float attrVertIndex;\n\nUNI float atlasNumX;\n\n#ifdef USE_ATLAS\n    OUT float randAtlas;\n#endif\n\nfloat rand(float n){return fract(sin(n) * 5711.5711123);}\n\n#define POINTMATERIAL\n\nvoid main()\n{\n    norm=attrVertNormal;\n    #ifdef PIXELSIZE\n        float psMul=1.0;\n    #endif\n\n    #ifndef PIXELSIZE\n        float psMul=sqrt(canvasWidth/canvasHeight)+0.00000000001;\n    #endif\n\n    #ifdef USE_ATLAS\n        randAtlas=atlasNumX*rand(attrVertIndex+vPosition.x);\n    #endif\n\n    vec3 tangent=attrTangent;\n    vec3 bitangent=attrBiTangent;\n\n\n    #ifdef VERTEX_COLORS\n        vertexColor=attrVertColor;\n    #endif\n\n    // #ifdef HAS_TEXTURES\n        texCoord=attrTexCoord;\n    // #endif\n\n    #ifdef HAS_TEXTURE_OPACITY\n        // opacity=texture(texOpacity,vec2(rand(attrVertIndex+texCoord.x*texCoord.y+texCoord.y+texCoord.x),rand(texCoord.y*texCoord.x-texCoord.x-texCoord.y-attrVertIndex))).r;\n        opacity=texture(texOpacity,texCoord).r;\n    #endif\n\n\n    #ifdef HAS_TEXTURE_COLORIZE\n        #ifdef RANDOM_COLORIZE\n            colorize=texture(texColorize,vec2(rand(attrVertIndex+texCoord.x*texCoord.y+texCoord.y+texCoord.x),rand(texCoord.y*texCoord.x-texCoord.x-texCoord.y-attrVertIndex)));\n        #endif\n        #ifndef RANDOM_COLORIZE\n            colorize=texture(texColorize,texCoord);\n        #endif\n    #endif\n\n\n\n\n\n    mat4 mMatrix=modelMatrix;\n    vec4 pos = vec4( vPosition, 1. );\n\n    gl_PointSize=0.0;\n\n    {{MODULE_VERTEX_POSITION}}\n\n    vec4 model=mMatrix * pos;\n\n    psMul+=rand(texCoord.x*texCoord.y+texCoord.y*3.0+texCoord.x*2.0+attrVertIndex)*randomSize;\n\n    float addPointSize=0.0;\n    #ifdef HAS_TEXTURE_POINTSIZE\n\n        #ifdef POINTSIZE_CHAN_R\n            addPointSize=texture(texPointSize,texCoord).r;\n        #endif\n        #ifdef POINTSIZE_CHAN_G\n            addPointSize=texture(texPointSize,texCoord).g;\n        #endif\n        #ifdef POINTSIZE_CHAN_B\n            addPointSize=texture(texPointSize,texCoord).b;\n        #endif\n\n        #ifdef DOTSIZEREMAPABS\n            addPointSize=1.0-(distance(addPointSize,0.5)*2.0);\n            addPointSize=addPointSize*addPointSize*addPointSize*2.0;\n        #endif\n\n        addPointSize*=texPointSizeMul;\n\n    #endif\n\n    ps=0.0;\n    #ifndef SCALE_BY_DISTANCE\n        ps = (pointSize+addPointSize+attrPointSize) * psMul;\n    #endif\n    #ifdef SCALE_BY_DISTANCE\n        float cameraDist = distance(model.xyz, camPos);\n        ps = ( (pointSize+addPointSize+attrPointSize) / cameraDist) * psMul;\n    #endif\n    ps=max(minPointSize,ps);\n    ps*=pixelRatio;\n\n    gl_PointSize += ps;\n\n\n    gl_Position = projMatrix * viewMatrix * model;\n}\n",};
const cgl = op.patch.cgl;

const
    render = op.inTrigger("render"),
    pointSize = op.inValueFloat("PointSize", 3),
    inPixelSize = op.inBool("Size in Pixels", false),
    randomSize = op.inValue("Random Size", 0),
    makeRound = op.inValueBool("Round", true),
    makeRoundAA = op.inValueBool("Round Antialias", false),
    doScale = op.inValueBool("Scale by Distance", false),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    a = op.inValueSlider("a", 1),
    vertCols = op.inBool("Vertex Colors", false),
    texture = op.inTexture("texture"),
    textureMulColor = op.inBool("Colorize Texture"),
    textureMask = op.inTexture("Texture Mask"),
    texMaskChan = op.inSwitch("Mask Channel", ["R", "A", "Luminance"], "R"),
    textureColorize = op.inTexture("Texture Colorize"),
    colorizeRandom = op.inValueBool("Colorize Randomize", false),
    textureOpacity = op.inTexture("Texture Opacity"),
    texturePointSize = op.inTexture("Texture Point Size"),
    texturePointSizeChannel = op.inSwitch("Point Size Channel", ["R", "G", "B"], "R"),
    texturePointSizeMul = op.inFloat("Texture Point Size Mul", 1),
    texturePointSizeMap = op.inSwitch("Map Size 0", ["Black", "Grey"], "Black"),
    flipTex = op.inValueBool("Flip Texture", false),

    inAtlasXFade = op.inBool("Atlas Cross Fade", false),
    inAtlasRepeatX = op.inFloat("Atlas Repeat X ", 1),
    inAtlasLookupTex = op.inTexture("Atlas Lookup"),
    inRotTex = op.inTexture("Rotate Texture"),
    minPointSize = op.inValueFloat("Min Point Size", 0),

    trigger = op.outTrigger("trigger"),
    shaderOut = op.outObject("shader", null, "shader");

op.setPortGroup("Texture", [texture, textureMulColor, textureMask, texMaskChan, textureColorize, textureOpacity, colorizeRandom]);
op.setPortGroup("Color", [r, g, b, a, vertCols]);
op.setPortGroup("Size", [pointSize, randomSize, makeRound, makeRoundAA, doScale, inPixelSize, texturePointSize, texturePointSizeMul, texturePointSizeChannel, texturePointSizeMap]);

op.setPortGroup("Atlas", [inAtlasRepeatX, inAtlasLookupTex, inAtlasXFade]);

r.setUiAttribs({ "colorPick": true });

const shader = new CGL.Shader(cgl, "PointMaterial", this);
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
shader.define("MAKE_ROUND");

op.toWorkPortsNeedToBeLinked(render);

const
    uniPointSize = new CGL.Uniform(shader, "f", "pointSize", pointSize),
    texturePointSizeMulUniform = new CGL.Uniform(shader, "f", "texPointSizeMul", texturePointSizeMul),
    uniRandomSize = new CGL.Uniform(shader, "f", "randomSize", randomSize),
    uniMinPointSize = new CGL.Uniform(shader, "f", "minPointSize", minPointSize),
    uniColor = new CGL.Uniform(shader, "4f", "color", r, g, b, a),
    uniRandAtlasX = new CGL.Uniform(shader, "f", "atlasNumX", inAtlasRepeatX),
    uniDpr = new CGL.Uniform(shader, "f", "pixelRatio", 1),
    uniWidth = new CGL.Uniform(shader, "f", "canvasWidth", cgl.canvasWidth),
    uniHeight = new CGL.Uniform(shader, "f", "canvasHeight", cgl.canvasHeight),
    textureUniform = new CGL.Uniform(shader, "t", "diffTex"),
    textureColorizeUniform = new CGL.Uniform(shader, "t", "texColorize"),
    textureOpacityUniform = new CGL.Uniform(shader, "t", "texOpacity"),
    textureColoPointSize = new CGL.Uniform(shader, "t", "texPointSize"),
    texturePointSizeUniform = new CGL.Uniform(shader, "t", "texPointSize"),
    textureMaskUniform = new CGL.Uniform(shader, "t", "texMask"),
    textureAtlasLookupUniform = new CGL.Uniform(shader, "t", "texAtlasLookup"),
    texRotUni = new CGL.Uniform(shader, "t", "texRot");

shader.setSource(attachments.pointmat_vert, attachments.pointmat_frag);
shader.glPrimitive = cgl.gl.POINTS;
shaderOut.setRef(shader);
shaderOut.ignoreValueSerialize = true;

doScale.onChange =
    inAtlasRepeatX.onChange =
    makeRound.onChange =
    makeRoundAA.onChange =
    texture.onChange =
    textureColorize.onChange =
    textureMask.onChange =
    colorizeRandom.onChange =
    flipTex.onChange =
    texMaskChan.onChange =
    inPixelSize.onChange =
    textureOpacity.onChange =
    texturePointSize.onChange =
    texturePointSizeMap.onChange =
    texturePointSizeChannel.onChange =
    textureMulColor.onChange =
    inAtlasLookupTex.onLinkChanged =
    inRotTex.onLinkChanged =
    vertCols.onChange = updateDefines;

render.onTriggered = doRender;
updateUi();

op.preRender = function ()
{
    if (shader)shader.bind();
    doRender();
};

function doRender()
{
    uniWidth.setValue(cgl.canvasWidth);
    uniHeight.setValue(cgl.canvasHeight);
    op.checkGraphicsApi();

    cgl.pushShader(shader);
    shader.popTextures();
    if (texture.get() && !texture.get().deleted) shader.pushTexture(textureUniform, texture.get());
    if (textureMask.get()) shader.pushTexture(textureMaskUniform, textureMask.get());
    if (textureColorize.get()) shader.pushTexture(textureColorizeUniform, textureColorize.get());
    if (textureOpacity.get()) shader.pushTexture(textureOpacityUniform, textureOpacity.get());
    if (texturePointSize.get()) shader.pushTexture(texturePointSizeUniform, texturePointSize.get());
    if (inAtlasLookupTex.get()) shader.pushTexture(textureAtlasLookupUniform, inAtlasLookupTex.get());
    if (inRotTex.get()) shader.pushTexture(texRotUni, inRotTex.get());

    uniDpr.set(cgl.pixelDensity);

    trigger.trigger();

    cgl.popShader();
}

function useAtlas()
{
    return inAtlasRepeatX.get() > 1 || inAtlasLookupTex.isLinked();
}

function updateUi()
{
    // inAtlasRepeatX.setUiAttribs({ "greyout": !useAtlas() });
    texMaskChan.setUiAttribs({ "greyout": !textureMask.isLinked() });

    texturePointSizeChannel.setUiAttribs({ "greyout": !texturePointSize.isLinked() });
    texturePointSizeMul.setUiAttribs({ "greyout": !texturePointSize.isLinked() });
    texturePointSizeMap.setUiAttribs({ "greyout": !texturePointSize.isLinked() });
}

function updateDefines()
{
    shader.toggleDefine("USE_ATLAS", useAtlas());

    shader.toggleDefine("SCALE_BY_DISTANCE", doScale.get());
    shader.toggleDefine("MAKE_ROUND", makeRound.get());
    shader.toggleDefine("MAKE_ROUNDAA", makeRoundAA.get());

    shader.toggleDefine("ATLAS_XFADE", inAtlasXFade.get());

    shader.toggleDefine("VERTEX_COLORS", vertCols.get());
    shader.toggleDefine("RANDOM_COLORIZE", colorizeRandom.get());
    shader.toggleDefine("HAS_TEXTURE_DIFFUSE", texture.get());
    shader.toggleDefine("HAS_TEXTURE_MASK", textureMask.isLinked());
    shader.toggleDefine("HAS_TEXTURE_COLORIZE", textureColorize.isLinked());
    shader.toggleDefine("HAS_TEXTURE_OPACITY", textureOpacity.isLinked());
    shader.toggleDefine("HAS_TEXTURE_POINTSIZE", texturePointSize.isLinked());
    shader.toggleDefine("HAS_TEXTURE_ATLASLOOKUP", inAtlasLookupTex.isLinked());
    shader.toggleDefine("HAS_TEXTURE_ROT", inRotTex.isLinked());

    shader.toggleDefine("TEXTURE_COLORIZE_MUL", textureMulColor.get());

    shader.toggleDefine("FLIP_TEX", flipTex.get());
    shader.toggleDefine("TEXTURE_MASK_R", texMaskChan.get() == "R");
    shader.toggleDefine("TEXTURE_MASK_A", texMaskChan.get() == "A");
    shader.toggleDefine("TEXTURE_MASK_LUMI", texMaskChan.get() == "Luminance");
    shader.toggleDefine("PIXELSIZE", inPixelSize.get());

    shader.toggleDefine("POINTSIZE_CHAN_R", texturePointSizeChannel.get() == "R");
    shader.toggleDefine("POINTSIZE_CHAN_G", texturePointSizeChannel.get() == "G");
    shader.toggleDefine("POINTSIZE_CHAN_B", texturePointSizeChannel.get() == "B");

    shader.toggleDefine("DOTSIZEREMAPABS", texturePointSizeMap.get() == "Grey");
    updateUi();
}

}
};






// **************************************************************
// 
// Ops.Gl.ImageCompose.Noise.SimplexNoise_v2
// 
// **************************************************************

Ops.Gl.ImageCompose.Noise.SimplexNoise_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"simplexnoise_frag":"IN vec2 texCoord;\nUNI sampler2D tex;\nUNI float amount;\nUNI float smoothness;\nUNI float scale;\nUNI float seed;\nUNI float x;\nUNI float y;\nUNI float time;\nUNI float aspect;\nUNI float harmonics;\n\n#ifdef HAS_TEX_OFFSETMAP\n    UNI sampler2D texOffsetZ;\n    UNI float offMul;\n#endif\n\n\n#ifdef HAS_TEX_MASK\n    UNI sampler2D texMask;\n#endif\n\n\n\n{{CGL.BLENDMODES3}}\n\nvoid FAST32_hash_3D(    vec3 gridcell,\n                        vec3 v1_mask,       //  user definable v1 and v2.  ( 0s and 1s )\n                        vec3 v2_mask,\n                        out vec4 hash_0,\n                        out vec4 hash_1,\n                        out vec4 hash_2 )       //  generates 3 random numbers for each of the 4 3D cell corners.  cell  corners:  v0=0,0,0  v3=1,1,1  the other two are user definable\n{\n    //    gridcell is assumed to be an integer coordinate\n\n    //  TODO:   these constants need tweaked to find the best possible noise.\n    //          probably requires some kind of brute force computational searching or something....\n    const vec2 OFFSET = vec2( 50.0, 161.0 );\n    const float DOMAIN = 69.0;\n    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );\n    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );\n\n    //  truncate the domain\n    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;\n    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );\n\n    //  compute x*x*y*y for the 4 corners\n    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;\n    P *= P;\n    vec4 V1xy_V2xy = mix( P.xyxy, P.zwzw, vec4( v1_mask.xy, v2_mask.xy ) );     //  appl y mask for v1 and v2\n    P = vec4( P.x, V1xy_V2xy.xz, P.z ) * vec4( P.y, V1xy_V2xy.yw, P.w );\n\n    //  get the lowz and highz mods\n    vec3 lowz_mods = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );\n    vec3 highz_mods = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );\n\n    //  appl mask for v1 and v2 mod values\n    v1_mask = ( v1_mask.z < 0.5 ) ? lowz_mods : highz_mods;\n    v2_mask = ( v2_mask.z < 0.5 ) ? lowz_mods : highz_mods;\n\n    //  compute the final hash\n    hash_0 = fract( P * vec4( lowz_mods.x, v1_mask.x, v2_mask.x, highz_mods.x ) );\n    hash_1 = fract( P * vec4( lowz_mods.y, v1_mask.y, v2_mask.y, highz_mods.y ) );\n    hash_2 = fract( P * vec4( lowz_mods.z, v1_mask.z, v2_mask.z, highz_mods.z ) );\n}\n\n\n//\n//  Given an arbitrary 3D point this calculates the 4 vectors from the corners of the simplex pyramid to the point\n//  It also returns the integer grid index information for the corners\n//\nvoid Simplex3D_GetCornerVectors(    vec3 P,                 //  input point\n                                    out vec3 Pi,            //  integer grid index for the origin\n                                    out vec3 Pi_1,          //  offsets for the 2nd and 3rd corners.  ( the 4th = Pi + 1.0 )\n                                    out vec3 Pi_2,\n                                    out vec4 v1234_x,       //  vectors from the 4 corners to the intput point\n                                    out vec4 v1234_y,\n                                    out vec4 v1234_z )\n{\n    //\n    //  Simplex math from Stefan Gustavsons and Ian McEwans work at...\n    //  http://github.com/ashima/webgl-noise\n    //\n\n    //  simplex math constants\n    const float SKEWFACTOR = 1.0/3.0;\n    const float UNSKEWFACTOR = 1.0/6.0;\n    const float SIMPLEX_CORNER_POS = 0.5;\n    const float SIMPLEX_PYRAMID_HEIGHT = 0.70710678118654752440084436210485;    // sqrt( 0.5 )  height of simplex pyramid.\n\n    P *= SIMPLEX_PYRAMID_HEIGHT;        // scale space so we can have an approx feature size of 1.0  ( optional )\n\n    //  Find the vectors to the corners of our simplex pyramid\n    Pi = floor( P + dot( P, vec3( SKEWFACTOR) ) );\n    vec3 x0 = P - Pi + dot(Pi, vec3( UNSKEWFACTOR ) );\n    vec3 g = step(x0.yzx, x0.xyz);\n    vec3 l = 1.0 - g;\n    Pi_1 = min( g.xyz, l.zxy );\n    Pi_2 = max( g.xyz, l.zxy );\n    vec3 x1 = x0 - Pi_1 + UNSKEWFACTOR;\n    vec3 x2 = x0 - Pi_2 + SKEWFACTOR;\n    vec3 x3 = x0 - SIMPLEX_CORNER_POS;\n\n    //  pack them into a parallel-friendly arrangement\n    v1234_x = vec4( x0.x, x1.x, x2.x, x3.x );\n    v1234_y = vec4( x0.y, x1.y, x2.y, x3.y );\n    v1234_z = vec4( x0.z, x1.z, x2.z, x3.z );\n}\n\n//\n//  Calculate the weights for the 3D simplex surflet\n//\nvec4 Simplex3D_GetSurfletWeights(   vec4 v1234_x,\n                                    vec4 v1234_y,\n                                    vec4 v1234_z )\n{\n    //  perlins original implementation uses the surlet falloff formula of (0.6-x*x)^4.\n    //  This is buggy as it can cause discontinuities along simplex faces.  (0.5-x*x)^3 solves this and gives an almost identical curve\n\n    //  evaluate surflet. f(x)=(0.5-x*x)^3\n    vec4 surflet_weights = v1234_x * v1234_x + v1234_y * v1234_y + v1234_z * v1234_z;\n    surflet_weights = max(0.5 - surflet_weights, 0.0);      //  0.5 here represents the closest distance (squared) of any simplex pyramid corner to any of its planes.  ie, SIMPLEX_PYRAMID_HEIGHT^2\n    return surflet_weights*surflet_weights*surflet_weights;\n}\n\n\n\n//\n//  SimplexPerlin3D  ( simplex gradient noise )\n//  Perlin noise over a simplex (tetrahedron) grid\n//  Return value range of -1.0->1.0\n//  http://briansharpe.files.wordpress.com/2012/01/simplexperlinsample.jpg\n//\n//  Implementation originally based off Stefan Gustavsons and Ian McEwans work at...\n//  http://github.com/ashima/webgl-noise\n//\nfloat SimplexPerlin3D(vec3 P)\n{\n    //  calculate the simplex vector and index math\n    vec3 Pi;\n    vec3 Pi_1;\n    vec3 Pi_2;\n    vec4 v1234_x;\n    vec4 v1234_y;\n    vec4 v1234_z;\n    Simplex3D_GetCornerVectors( P, Pi, Pi_1, Pi_2, v1234_x, v1234_y, v1234_z );\n\n    //  generate the random vectors\n    //  ( various hashing methods listed in order of speed )\n    vec4 hash_0;\n    vec4 hash_1;\n    vec4 hash_2;\n    FAST32_hash_3D( Pi, Pi_1, Pi_2, hash_0, hash_1, hash_2 );\n    //SGPP_hash_3D( Pi, Pi_1, Pi_2, hash_0, hash_1, hash_2 );\n    hash_0 -= 0.49999;\n    hash_1 -= 0.49999;\n    hash_2 -= 0.49999;\n\n    //  evaluate gradients\n    vec4 grad_results = inversesqrt( hash_0 * hash_0 + hash_1 * hash_1 + hash_2 * hash_2 ) * ( hash_0 * v1234_x + hash_1 * v1234_y + hash_2 * v1234_z );\n\n    //  Normalization factor to scale the final result to a strict 1.0->-1.0 range\n    //  x = sqrt( 0.75 ) * 0.5\n    //  NF = 1.0 / ( x * ( ( 0.5 * x*x ) ^ 3 ) * 2.0 )\n    //  http://briansharpe.wordpress.com/2012/01/13/simplex-noise/#comment-36\n     float FINAL_NORMALIZATION = 37.837227241611314102871574478976*smoothness;\n\n    //  sum with the surflet and return\n    return dot( Simplex3D_GetSurfletWeights( v1234_x, v1234_y, v1234_z ), grad_results ) * FINAL_NORMALIZATION;\n}\n\nvoid main()\n{\n    vec2 p=vec2(texCoord.x-0.5,texCoord.y-0.5);\n\n    p.x*=aspect;\n    p=p*scale;\n\n    p=vec2(p.x+0.5-x,p.y+0.5-y);\n\n    vec3 offset;\n    #ifdef HAS_TEX_OFFSETMAP\n        vec4 offMap=texture(texOffsetZ,texCoord);\n\n        #ifdef OFFSET_X_R\n            offset.x=offMap.r;\n        #endif\n        #ifdef OFFSET_X_G\n            offset.x=offMap.g;\n        #endif\n        #ifdef OFFSET_X_B\n            offset.x=offMap.b;\n        #endif\n\n        #ifdef OFFSET_Y_R\n            offset.y=offMap.r;\n        #endif\n        #ifdef OFFSET_Y_G\n            offset.y=offMap.g;\n        #endif\n        #ifdef OFFSET_Y_B\n            offset.y=offMap.b;\n        #endif\n\n        #ifdef OFFSET_Z_R\n            offset.z=offMap.r;\n        #endif\n        #ifdef OFFSET_Z_G\n            offset.z=offMap.g;\n        #endif\n        #ifdef OFFSET_Z_B\n            offset.z=offMap.b;\n        #endif\n\n        offset*=offMul;\n    #endif\n\n    float v=SimplexPerlin3D(vec3(p.x,p.y,time)+offset)*0.5+0.5;\n\n\n    if (harmonics >= 2.0) v += SimplexPerlin3D(vec3(p.x,p.y,time)*2.3+offset) * 0.5;\n    if (harmonics >= 3.0) v += SimplexPerlin3D(vec3(p.x,p.y,time)*4.2+offset) * 0.25;\n    if (harmonics >= 4.0) v += SimplexPerlin3D(vec3(p.x,p.y,time)*8.1+offset) * 0.125;\n    if (harmonics >= 5.0) v += SimplexPerlin3D(vec3(p.x,p.y,time)*16.7+offset) * 0.0625;\n\n\n\n    //blend section\n    vec4 col=vec4(v,v,v,1.0);\n\n    vec4 base=texture(tex,texCoord);\n\n    // outColor=cgl_blend(base,col,amount);\n\n\n    float str=1.0;\n    #ifdef HAS_TEX_MASK\n        str=texture(texMask,texCoord).r;\n    #endif\n\n    outColor=cgl_blendPixel(base,col,amount*str);\n\n}",};
const
    render = op.inTrigger("render"),
    inTexMask = op.inTexture("Mask"),
    blendMode = CGL.TextureEffect.AddBlendSelect(op, "Blend Mode", "normal"),
    amount = op.inValueSlider("Amount", 1),
    maskAlpha = CGL.TextureEffect.AddBlendAlphaMask(op),
    smoothness = op.inValue("smoothness", 1.0),
    inHarmonics = op.inSwitch("Harmonics", ["1", "2", "3", "4", "5"], "1"),
    scale = op.inValue("scale", 7),
    trigger = op.outTrigger("trigger"),
    x = op.inValue("x"),
    y = op.inValue("y"),
    time = op.inValue("time", 0);

const
    inTexOffsetZ = op.inTexture("Offset"),
    inOffsetMul = op.inFloat("Offset Multiply", 1),
    offsetX = op.inSwitch("Offset X", ["None", "R", "G", "B"], "None"),
    offsetY = op.inSwitch("Offset Y", ["None", "R", "G", "B"], "None"),
    offsetZ = op.inSwitch("Offset Z", ["None", "R", "G", "B"], "R");

op.setPortGroup("Offset Map", [inTexOffsetZ, offsetZ, offsetY, offsetX, inOffsetMul]);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name, op);

shader.setSource(shader.getDefaultVertexShader(), attachments.simplexnoise_frag);

const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),
    textureUniformOffZ = new CGL.Uniform(shader, "t", "texOffsetZ", 1),
    uniTexMask = new CGL.Uniform(shader, "t", "texMask", 2),
    amountUniform = new CGL.Uniform(shader, "f", "amount", amount),
    uniSmoothness = new CGL.Uniform(shader, "f", "smoothness", smoothness),
    uniScale = new CGL.Uniform(shader, "f", "scale", scale),
    uniX = new CGL.Uniform(shader, "f", "x", x),
    uniY = new CGL.Uniform(shader, "f", "y", y),
    uniAspect = new CGL.Uniform(shader, "f", "aspect", 1),
    uniTime = new CGL.Uniform(shader, "f", "time", time),
    uniOffMul = new CGL.Uniform(shader, "f", "offMul", inOffsetMul),
    uniHarmonics = new CGL.Uniform(shader, "f", "harmonics", 0);

inHarmonics.onChange = () =>
{
    uniHarmonics.setValue(parseFloat(inHarmonics.get()));
};

CGL.TextureEffect.setupBlending(op, shader, blendMode, amount, maskAlpha);

offsetX.onChange =
offsetY.onChange =
offsetZ.onChange =
inTexMask.onChange =
inTexOffsetZ.onChange = updateDefines;
updateDefines();

function updateDefines()
{
    shader.toggleDefine("HAS_TEX_OFFSETMAP", inTexOffsetZ.get());
    shader.toggleDefine("HAS_TEX_MASK", inTexMask.get());

    shader.toggleDefine("OFFSET_X_R", offsetX.get() == "R");
    shader.toggleDefine("OFFSET_X_G", offsetX.get() == "G");
    shader.toggleDefine("OFFSET_X_B", offsetX.get() == "B");

    shader.toggleDefine("OFFSET_Y_R", offsetY.get() == "R");
    shader.toggleDefine("OFFSET_Y_G", offsetY.get() == "G");
    shader.toggleDefine("OFFSET_Y_B", offsetY.get() == "B");

    shader.toggleDefine("OFFSET_Z_R", offsetZ.get() == "R");
    shader.toggleDefine("OFFSET_Z_G", offsetZ.get() == "G");
    shader.toggleDefine("OFFSET_Z_B", offsetZ.get() == "B");

    offsetX.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetY.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    offsetZ.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
    inOffsetMul.setUiAttribs({ "greyout": !inTexOffsetZ.isLinked() });
}

render.onTriggered = function ()
{
    if (!CGL.TextureEffect.checkOpInEffect(op, 3)) return;

    cgl.pushShader(shader);
    cgl.currentTextureEffect.bind();

    uniAspect.setValue(cgl.currentTextureEffect.aspectRatio);

    cgl.setTexture(0, cgl.currentTextureEffect.getCurrentSourceTexture().tex);
    if (inTexOffsetZ.get()) cgl.setTexture(1, inTexOffsetZ.get().tex);
    if (inTexMask.get()) cgl.setTexture(2, inTexMask.get().tex);

    cgl.currentTextureEffect.finish();
    cgl.popShader();

    trigger.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.TextureProjection_v2
// 
// **************************************************************

Ops.Gl.ShaderEffects.TextureProjection_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"maptexture_frag":"IN vec2 MOD_tc;\n\n#ifdef MOD_MAP_TRIPLANAR\n    IN vec2 MOD_tc1;\n    IN vec2 MOD_tc2;\n    IN vec3 MOD_blendingTri;\n#endif\n\n\n{{CGL.BLENDMODES3}}","maptexture_vert":"vec3 MOD_pos;\n\n#ifndef MOD_WORLDSPACE\n   MOD_pos=(vec4(vPosition,1.0)*1.0/MOD_scale).xyz;\n#endif\n#ifdef MOD_WORLDSPACE\n   MOD_pos=(mMatrix*pos).xyz*1.0/MOD_scale;\n#endif\n\nMOD_pos=(vec4(MOD_pos,1.0)*MOD_rotationX(MOD_rotX*MOD_DEG2RAD)).xyz;\nMOD_pos=(vec4(MOD_pos,1.0)*MOD_rotationY(MOD_rotY*MOD_DEG2RAD)).xyz;\nMOD_pos=(vec4(MOD_pos,1.0)*MOD_rotationZ(MOD_rotZ*MOD_DEG2RAD)).xyz;\n\n#ifdef MOD_MAP_XY\n    MOD_tc=MOD_pos.xy;\n#endif\n#ifdef MOD_MAP_XZ\n    MOD_tc=MOD_pos.xz;\n#endif\n#ifdef MOD_MAP_YZ\n    MOD_tc=MOD_pos.yz;\n#endif\n\nMOD_tc.xy+=vec2(0.5,0.5);\nMOD_tc.xy+=MOD_offset;\n\n\n#ifdef MOD_TARGET_POINTSIZE\n\n    gl_PointSize+=(texture(MOD_tex,MOD_tc).x*MOD_amount);\n\n#endif\n\n\n#ifdef MOD_MAP_TRIPLANAR\n    mapTriplanar((mMatrix*vec4(attrVertNormal,1.0)).xyz,MOD_pos);\n#endif\n\n","maptexture_body_frag":"#ifndef MOD_TARGET_POINTSIZE\n\n\n    vec4 MOD_color;\n\n    #ifdef MOD_MAP_TRIPLANAR\n        vec4 xaxis = texture( MOD_tex, MOD_tc);\n        vec4 yaxis = texture( MOD_tex, MOD_tc1);\n        vec4 zaxis = texture( MOD_tex, MOD_tc2);\n        MOD_color = xaxis *MOD_blendingTri.x + yaxis *MOD_blendingTri.y + zaxis *MOD_blendingTri.z;\n        MOD_color.a=1.0;\n    #endif\n\n\n    vec2 MOD_ntc=MOD_tc;\n\n    #ifdef MOD_MAP_SCREEN\n        MOD_ntc=(vec2(gl_FragCoord.x,gl_FragCoord.y)/vec2(MOD_viewPortW,MOD_viewPortH));\n\n        MOD_ntc-=vec2(0.5,0.5);\n        MOD_ntc*=1.0/MOD_scale;\n        MOD_ntc+=vec2(0.5,0.5);\n        MOD_ntc-=MOD_offset;\n    #endif\n\n    #ifdef MOD_MAP_TEXCOORD\n        MOD_ntc=texCoord*1.0/MOD_scale-MOD_offset;\n    #endif\n\n    #ifdef MOD_MAP_TEXCOORD1\n        MOD_ntc=texCoord1*1.0/MOD_scale-MOD_offset;\n    #endif\n\n    #ifdef MOD_MAP_TEXCOORD2\n        MOD_ntc=texCoord2*1.0/MOD_scale-MOD_offset;\n    #endif\n\n\n    #ifdef MOD_DISCARD\n    if(MOD_ntc.x>0.0 && MOD_ntc.x<1.0 && MOD_ntc.y>0.0 && MOD_ntc.y<1.0)\n    {\n    #endif\n\n        #ifndef MOD_MAP_TRIPLANAR\n            MOD_color=texture(MOD_tex,MOD_ntc);\n        #endif\n\n        #ifdef MOD_USE_IMGALPHA\n            col.a=MOD_color.a;\n        #endif\n\n        #ifdef MOD_TARGET_COLOR\n        col=cgl_blendPixel(col,MOD_color,MOD_amount*col.a);\n        #endif\n        #ifdef MOD_TARGET_ALPHA\n        col.a=1.0-MOD_color.r*MOD_amount;\n        #endif\n\n    #ifdef MOD_DISCARD\n    }\n\n    #endif\n#endif\n","maptexture_body_vert":"OUT vec2 MOD_tc;\n\nconst float MOD_DEG2RAD = 0.017453292519943;\n\n#ifdef MOD_MAP_TRIPLANAR\n\n    OUT vec2 MOD_tc1;\n    OUT vec2 MOD_tc2;\n    OUT vec3 MOD_blendingTri;\n\n    void mapTriplanar(vec3 wNorm,vec3 pos)\n    {\n        vec3 blending = abs( wNorm );\n        blending = normalize(max(blending, 0.1));\n        float b = (blending.x + blending.y + blending.z);\n        blending /= vec3(b);\n        MOD_blendingTri=blending;\n\n        MOD_tc = pos.yz;\n        MOD_tc1 = pos.xz;\n        MOD_tc2 = pos.xy;\n    }\n\n#endif\n\nmat4 MOD_rotationX( in float angle ) {\n\treturn mat4(\t1.0,\t\t0,\t\t\t0,\t\t\t0,\n\t\t\t \t\t0, \tcos(angle),\t-sin(angle),\t\t0,\n\t\t\t\t\t0, \tsin(angle),\t cos(angle),\t\t0,\n\t\t\t\t\t0, \t\t\t0,\t\t\t  0, \t\t1);\n}\n\nmat4 MOD_rotationY( in float angle ) {\n\treturn mat4(\tcos(angle),\t\t0,\t\tsin(angle),\t0,\n\t\t\t \t\t\t\t0,\t\t1.0,\t\t\t 0,\t0,\n\t\t\t\t\t-sin(angle),\t0,\t\tcos(angle),\t0,\n\t\t\t\t\t\t\t0, \t\t0,\t\t\t\t0,\t1);\n}\n\nmat4 MOD_rotationZ( in float angle ) {\n\treturn mat4(\tcos(angle),\t\t-sin(angle),\t0,\t0,\n\t\t\t \t\tsin(angle),\t\tcos(angle),\t\t0,\t0,\n\t\t\t\t\t\t\t0,\t\t\t\t0,\t\t1,\t0,\n\t\t\t\t\t\t\t0,\t\t\t\t0,\t\t0,\t1);\n}\n",};
const
    render = op.inTrigger("render"),
    next = op.outTrigger("trigger"),
    inTex = op.inTexture("Texture"),

    inBlend = CGL.TextureEffect.AddBlendSelect(op, "blendMode"),
    inAmount = op.inValueSlider("Amount", 0.3),

    inTarget = op.inSwitch("Target", ["Color", "Pointsize", "Alpha"], "Color"),
    inScale = op.inValue("Scale", 10),

    inUseTexAlpha = op.inBool("Use Texture Alpha", false),

    inPosX = op.inFloat("Pos X", 0),
    inPosY = op.inFloat("Pos Y", 0),

    inRotX = op.inFloat("Rot X", 0),
    inRotY = op.inFloat("Rot Y", 0),
    inRotZ = op.inFloat("Rot Z", 0),

    inMethod = op.inValueSelect("Mapping", ["Triplanar", "XY", "XZ", "YZ", "Screen", "TexCoords 1", "TexCoords 2", "TexCoords 3"], "XY"),
    inDiscard = op.inValueBool("Discard"),
    inWorldSpace = op.inValueBool("WorldSpace");

const cgl = op.patch.cgl;

render.onLinkChanged =
inUseTexAlpha.onChange =
    inTarget.onChange =
    inBlend.onChange =
    inDiscard.onChange =
    inWorldSpace.onChange =
    inTex.onLinkChanged =
    inMethod.onChange = updateDefines;

op.toWorkPortsNeedToBeLinked(inTex, next);

op.setPortGroup("Rotation", [inRotX, inRotY, inRotZ]);
op.setPortGroup("Position", [inPosX, inPosY]);

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.maptexture_body_vert,
    "srcBodyVert": attachments.maptexture_vert,
    "attributes": [
        { "type": "vec2", "name": "attrTexCoord1", "nameFrag": "texCoord1" },
        { "type": "vec2", "name": "attrTexCoord2", "nameFrag": "texCoord2" }]
});

let head_frag = attachments.maptexture_frag;
// head_frag = head_frag.replace("{{BLENDCODE}}", CGL.TextureEffect.getBlendCode(3));

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": head_frag,
    "srcBodyFrag": attachments.maptexture_body_frag
});

mod.addUniformBoth("f", "MOD_rotX", inRotX);
mod.addUniformBoth("f", "MOD_rotY", inRotY);
mod.addUniformBoth("f", "MOD_rotZ", inRotZ);

mod.addUniformBoth("t", "MOD_tex");
mod.addUniformBoth("f", "MOD_scale", inScale);
mod.addUniformBoth("f", "MOD_amount", inAmount);
mod.addUniformBoth("2f", "MOD_offset", inPosX, inPosY);

const uniWidth = mod.addUniformFrag("f", "MOD_viewPortW");
const uniHeight = mod.addUniformFrag("f", "MOD_viewPortH");

CGL.TextureEffect.setupBlending(op, mod, inBlend, inAmount);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_USE_IMGALPHA", inUseTexAlpha.get());
    mod.toggleDefine("MOD_WORLDSPACE", inWorldSpace.get());
    mod.toggleDefine("MOD_MAP_XY", inMethod.get() == "XY");
    mod.toggleDefine("MOD_MAP_XZ", inMethod.get() == "XZ");
    mod.toggleDefine("MOD_MAP_YZ", inMethod.get() == "YZ");
    mod.toggleDefine("MOD_MAP_TEXCOORD", inMethod.get() == "TexCoords 1");
    mod.toggleDefine("MOD_MAP_TEXCOORD1", inMethod.get() == "TexCoords 2");
    mod.toggleDefine("MOD_MAP_TEXCOORD2", inMethod.get() == "TexCoords 3");
    mod.toggleDefine("MOD_MAP_SCREEN", inMethod.get() == "Screen");
    mod.toggleDefine("MOD_MAP_TRIPLANAR", inMethod.get() == "Triplanar");
    mod.toggleDefine("MOD_DISCARD", inDiscard.get());

    mod.toggleDefine("MOD_BLEND_NORMAL", inBlend.get() == "Normal");
    mod.toggleDefine("MOD_BLEND_ADD", inBlend.get() == "Add");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");
    mod.toggleDefine("MOD_BLEND_MUL", inBlend.get() == "Mul");

    mod.toggleDefine("MOD_TARGET_ALPHA", inTarget.get() == "Alpha");
    mod.toggleDefine("MOD_TARGET_COLOR", inTarget.get() == "Color");
    mod.toggleDefine("MOD_TARGET_POINTSIZE", inTarget.get() == "Pointsize");

    if (inTarget.get() == "Pointsize" && inMethod.get() == "Screen")op.setUiError("pointscreen", "This combination of Mapping and Target is not possible", 1);
    else op.setUiError("pointscreen", null);

    CGL.TextureEffect.setupBlending(op, mod, inBlend, inAmount);
}

render.onTriggered = function ()
{
    const vp = cgl.getViewPort();

    mod.bind();
    mod.setUniformValue("MOD_viewPortW", vp[2]);
    mod.setUniformValue("MOD_viewPortH", vp[3]);
    let tex = inTex.get();
    if (!tex) tex = CGL.Texture.getEmptyTexture(cgl).tex;
    else tex = tex.tex;

    mod.pushTexture("MOD_tex", tex);

    next.trigger();
    mod.unbind();
};

}
};






// **************************************************************
// 
// Ops.WebAudio.Output_v2
// 
// **************************************************************

Ops.WebAudio.Output_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inAudio = op.inObject("Audio In", null, "audioNode"),
    inGain = op.inFloatSlider("Volume", 1),
    inMute = op.inBool("Mute", false),
    inShowSusp = op.inBool("Show Audio Suspended Button", true),
    outVol = op.outNumber("Current Volume", 0),
    outChannels = op.outNumber("Number Of Channels"),
    outState = op.outString("Context State", "unknown");

op.setPortGroup("Volume Settings", [inMute, inGain]);

let isSuspended = false;
let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
let gainNode = audioCtx.createGain();
const destinationNode = audioCtx.destination;
let oldAudioIn = null;
let connectedToOut = false;

inMute.onChange = () =>
{
    mute(inMute.get());
    updateStateError();
};

inGain.onChange = setVolume;
op.onMasterVolumeChanged = setVolume;

let pauseId = op.patch.on("pause", setVolume);
let resumeId = op.patch.on("resume", setVolume);

audioCtx.addEventListener("statechange", updateStateError);
inShowSusp.onChange = updateAudioStateButton;

updateStateError();
updateAudioStateButton();

op.onDelete = () =>
{
    if (gainNode) gainNode.disconnect();
    gainNode = null;
    if (CABLES.interActionNeededButton) CABLES.interActionNeededButton.remove("audiosuspended");
    if (pauseId) op.patch.off(pauseId);
    if (resumeId) op.patch.off(resumeId);
};

inAudio.onChange = function ()
{
    op.setUiError("multipleInputs", null);
    if (oldAudioIn)
    {
        try
        {
            if (oldAudioIn.disconnect)
            {
                oldAudioIn.disconnect(gainNode);
            }
        }
        catch (e)
        {
            op.logError(e);
        }
    }

    if (connectedToOut)
    {
        if (gainNode)
        {
            gainNode.disconnect(destinationNode);
        }
        connectedToOut = false;
    }

    if (inAudio.get())
    {
        if (inAudio.links.length > 1) op.setUiError("multipleInputs", "You have connected multiple inputs. It is possible that you experience unexpected behaviour. Please use a Mixer op to connect multiple audio streams.", 1);
        else op.setUiError("multipleInputs", null);

        if (inAudio.get().connect)
        {
            inAudio.get().connect(gainNode);
        }
    }

    oldAudioIn = inAudio.get();

    if (!connectedToOut)
    {
        if (gainNode)
        {
            gainNode.connect(destinationNode);
        }
        connectedToOut = true;
    }

    if (audioCtx && audioCtx.destination)
    {
        outChannels.set(audioCtx.destination.maxChannelCount);
    }
    else
    {
        outChannels.set(0);
    }

    setVolume();
};

function setVolume()
{
    const masterVolume = op.patch.config.masterVolume || 0;

    let volume = inGain.get() * masterVolume;
    if (op.patch._paused || inMute.get()) volume = 0;
    volume = CABLES.clamp(volume, 0, 1);

    if (!gainNode) op.logError("gainNode undefined");
    if (gainNode) gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.05);

    outVol.set(volume);
}

function mute(b)
{
    if (b)
    {
        if (audioCtx.state === "suspended")
        { // make sure that when audio context is suspended node will also be muted
            // this prevents the initial short sound burst being heard when context is suspended
            // and started from user interaction
            // also note, we have to cancel the already scheduled values as we have no influence over
            // the order in which onchange handlers are executed

            if (gainNode)
            {
                gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
                gainNode.gain.value = 0;
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            }

            outVol.set(0);

            return;
        }
    }

    setVolume();
}

function updateStateError()
{
    outState.set(audioCtx.state);
    // op.logVerbose("audioCtx.state change", audioCtx.state);

    op.setUiError("ctxSusp", null);
    if (audioCtx.state == "suspended")
    {
        const errorText = "Your Browser suspended audio context, use playButton op to play audio after a user interaction";
        let level = 1;
        if (inMute.get()) level = 0;
        op.setUiError("ctxSusp", errorText, level);
    }

    updateAudioStateButton();
}

function updateAudioStateButton()
{
    if (audioCtx.state == "suspended")
    {
        mute(true);
        if (inShowSusp.get())
        {
            isSuspended = true;

            if (CABLES.interActionNeededButton)
            {
                CABLES.interActionNeededButton.add(op.patch, "audiosuspended", () =>
                {
                    if (audioCtx && audioCtx.state == "suspended")
                    {
                        audioCtx.resume();
                        if (CABLES.interActionNeededButton)CABLES.interActionNeededButton.remove("audiosuspended");
                    }
                });
            }
        }
        else
        {
            if (CABLES.interActionNeededButton)CABLES.interActionNeededButton.remove("audiosuspended");
        }
    }
    else
    {
        if (CABLES.interActionNeededButton)CABLES.interActionNeededButton.remove("audiosuspended");

        if (isSuspended)
        {
            op.log("was suspended - set vol");
            setVolume();
        }
    }
}

}
};






// **************************************************************
// 
// Ops.WebAudio.AudioBufferPlayer_v2
// 
// **************************************************************

Ops.WebAudio.AudioBufferPlayer_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// input ports
const audioBufferPort = op.inObject("Audio Buffer", null, "audioBuffer");
const playPort = op.inBool("Start / Stop", false);

const loopPort = op.inBool("Loop", false);
const inResetStart = op.inTriggerButton("Restart");
const offsetPort = op.inFloat("Offset", 0);
const playbackRatePort = op.inFloat("Playback Rate", 1);
const detunePort = op.inFloat("Detune", 0);

op.setPortGroup("Playback Controls", [playPort, loopPort, inResetStart]);
op.setPortGroup("Time Controls", [offsetPort]);
op.setPortGroup("Miscellaneous", [playbackRatePort, detunePort]);

// output ports
const audioOutPort = op.outObject("Audio Out", null, "audioNode");
const outPlaying = op.outBoolNum("Is Playing", false);
const outLoading = op.outBoolNum("Loading", false);

// vars
let source = null;
let isPlaying = false;
let hasEnded = false;
let pausedAt = null;
let startedAt = null;
let isLoading = false;

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const gainNode = audioCtx.createGain();

if (!audioBufferPort.isLinked())
{
    op.setUiError("inputNotConnected", "To be able to play back sound, you need to connect an AudioBuffer to this op.", 0);
}
else
{
    op.setUiError("inputNotConnected", null);
}

audioBufferPort.onLinkChanged = () =>
{
    if (!audioBufferPort.isLinked())
    {
        op.setUiError("inputNotConnected", "To be able to play back sound, you need to connect an AudioBuffer to this op.", 0);
    }
    else
    {
        op.setUiError("inputNotConnected", null);
    }
};

if (!audioOutPort.isLinked())
{
    op.setUiError("outputNotConnected", "To be able to hear sound playing, you need to connect this op to an Output op.", 0);
}
else
{
    op.setUiError("outputNotConnected", null);
}

audioOutPort.onLinkChanged = () =>
{
    if (!audioOutPort.isLinked())
    {
        op.setUiError("outputNotConnected", "To be able to hear sound playing, you need to connect this op to an Output op.", 0);
    }
    else
    {
        op.setUiError("outputNotConnected", null);
    }
};

// change listeners
audioBufferPort.onChange = function ()
{
    if (audioBufferPort.get()) createAudioBufferSource();
    else
    {
        if (isLoading)
        {
            isLoading = false;
            outLoading.set(isLoading);
        }

        if (isPlaying)
        {
            stop(0);
            if (source) source.buffer = null;
            source = null;
        }
    }
};

playPort.onChange = function ()
{
    if (!audioBufferPort.get()) return;

    if (!source)
    {
        if (!isLoading) createAudioBufferSource();
    }

    if (playPort.get())
    {
        const startTime = 0;
        start(startTime);
    }
    else
    {
        const stopTime = 0;
        stop(stopTime);
    }
};

loopPort.onChange = function ()
{
    if (source)
    {
        source.loop = !!loopPort.get();
    }
};

detunePort.onChange = setDetune;

function setDetune()
{
    if (!source) return;

    const detune = detunePort.get() || 0;
    if (source.detune)
    {
        source.detune.setValueAtTime(
            detune,
            audioCtx.currentTime
        );
    }
}

playbackRatePort.onChange = setPlaybackRate;

function setPlaybackRate()
{
    if (!source) return;

    const playbackRate = playbackRatePort.get() || 0;
    if (playbackRate >= source.playbackRate.minValue && playbackRate <= source.playbackRate.maxValue)
    {
        source.playbackRate.setValueAtTime(
            playbackRate,
            audioCtx.currentTime
        );
    }
}

let resetTriggered = false;
inResetStart.onTriggered = function ()
{
    if (!source) return;
    if (!audioBufferPort.get()) return;
    else
    {
        if (!(audioBufferPort.get() instanceof AudioBuffer)) return;
    }

    if (playPort.get())
    {
        if (isPlaying)
        {
            resetTriggered = true;
            stop(0);
        }
        else
        {
            start(0);
        }
    }
};

// functions
function createAudioBufferSource(dontStart = false)
{
    if (isLoading) return;
    if (!(audioBufferPort.get() instanceof AudioBuffer)) return;

    isLoading = true;
    outLoading.set(isLoading);

    if (source)
    {
        source.onended = null;

        if (source.buffer)
        {
            stop(0);
            source.disconnect(gainNode);
            source.buffer = null;
        }

        source = null;
    }

    source = audioCtx.createBufferSource();

    const buffer = audioBufferPort.get();

    if (!buffer)
    {
        isLoading = false;
        outLoading.set(isLoading);
        return;
    }

    source.buffer = buffer;
    source.onended = onPlaybackEnded;
    source.loop = loopPort.get();
    source.connect(gainNode);
    setPlaybackRate();
    setDetune();
    audioOutPort.setRef(gainNode);

    isLoading = false;
    outLoading.set(isLoading);

    if (resetTriggered)
    {
        start(0);
        resetTriggered = false;
        return;
    }

    if (playPort.get() && !dontStart)
    {
        // if (!isPlaying)
        start(0);
    }
}

let timeOuting = false;
let timerId = null;

offsetPort.onChange = () =>
{
    if (offsetPort.get() >= 0) op.setUiError("offsetNegative", null);
    else
    {
        op.setUiError("offsetNegative", "Offset cannot be negative. Setting to 0.", 1);
    }

    if (source)
    {
        if (source.buffer)
        {
            if (offsetPort.get() > source.buffer.duration)
            {
                op.setUiError("offsetTooLong", "Your offset value is higher than the total time of your audio file. Please decrease the duration to be able to hear sound when playing back your buffer.", 1);
            }
            else
            {
                op.setUiError("offsetTooLong", null);
            }
        }
    }
};

function start(time)
{
    try
    {
        if (source)
        {
            let offset = Math.max(0, offsetPort.get());
            source.start(time, offset); // 0 = now

            isPlaying = true;
            hasEnded = false;
            outPlaying.set(true);
        }
        else
        {
            op.log("start() but no src...");
        }
    }
    catch (e)
    {
        op.log("Error on start: ", e.message);
        outPlaying.set(false);

        isPlaying = false;
    }
}

function recreateBuffer()
{
    let dontStart = !loopPort.get();
    createAudioBufferSource(dontStart);
}

function stop(time)
{
    try
    {
        if (source)
        {
            source.stop();
            if (!resetTriggered) recreateBuffer();
        }

        isPlaying = false;
        outPlaying.set(false);
    }
    catch (e)
    {
        op.setUiError(e);
        outPlaying.set(false);
    }
}

function onPlaybackEnded()
{
    if (loopPort.get())
    {
        isPlaying = true;
        hasEnded = false;
    }
    else
    {
        isPlaying = false;
        hasEnded = true;
    }
    outPlaying.set(isPlaying);

    recreateBuffer();
}

}
};






// **************************************************************
// 
// Ops.WebAudio.Gain
// 
// **************************************************************

Ops.WebAudio.Gain= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const audioIn = op.inObject("audio in", null, "audioNode");
const gain = op.inFloatSlider("gain", 1);
const inMute = op.inBool("Mute", false);
const audioOut = op.outObject("audio out", null, "audioNode");

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const gainNode = audioContext.createGain();

gain.onChange = () =>
{
    if (inMute.get()) return;

    gainNode.gain.setValueAtTime(Number(gain.get()) || 0, audioCtx.currentTime);
};

inMute.onChange = () =>
{
    if (inMute.get())
    {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
    }
    else
    {
        gainNode.gain.linearRampToValueAtTime(Number(gain.get()) || 0, audioCtx.currentTime + 0.01);
    }
};
let oldAudioIn = null;

audioIn.onChange = function ()
{
    if (!audioIn.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect) oldAudioIn.disconnect(gainNode);
            }
            catch (e)
            {
                op.log(e);
            }
        }
        audioOut.set(null);
    }
    else
    {
        if (audioIn.get().connect) audioIn.get().connect(gainNode);
    }
    oldAudioIn = audioIn.get();
    audioOut.set(gainNode);
};

}
};






// **************************************************************
// 
// Ops.Devices.Mouse.MouseWheel_v2
// 
// **************************************************************

Ops.Devices.Mouse.MouseWheel_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    speed = op.inValue("Speed", 1),
    preventScroll = op.inValueBool("prevent scroll", true),
    flip = op.inValueBool("Flip Direction"),
    inSimpleIncrement = op.inBool("Simple Delta", true),
    area = op.inSwitch("Area", ["Canvas", "Document", "Parent"], "Document"),
    active = op.inValueBool("active", true),
    delta = op.outNumber("delta", 0),
    deltaX = op.outNumber("delta X", 0),
    deltaOrig = op.outNumber("browser event delta", 0),
    trigger = op.outTrigger("Wheel Action");

const cgl = op.patch.cgl;
const value = 0;

const startTime = CABLES.now() / 1000.0;
const v = 0;

let dir = 1;

let listenerElement = null;

area.onChange = updateArea;
const vOut = 0;

addListener();

flip.onChange = function ()
{
    if (flip.get())dir = -1;
    else dir = 1;
};

function normalizeWheel(event)
{
    let sY = 0;

    if ("detail" in event) { sY = event.detail; }

    if ("deltaY" in event)
    {
        sY = event.deltaY;
        // if (deltaY < 1.0)deltaY *= 16;
        if (event.deltaY > 20)sY = 20;
        else if (event.deltaY < -20)sY = -20;
    }
    return sY * dir;
}

function normalizeWheelX(event)
{
    let sX = 0;

    if ("deltaX" in event)
    {
        sX = event.deltaX;
        if (event.deltaX > 20)sX = 20;
        else if (event.deltaX < -20)sX = -20;
    }
    return sX;
}

let lastEvent = 0;

function onMouseWheel(e)
{
    if (Date.now() - lastEvent < 10) return;
    lastEvent = Date.now();

    deltaOrig.set(e.wheelDelta || e.deltaY);

    if (e.deltaY)
    {
        let d = normalizeWheel(e);
        if (inSimpleIncrement.get())
        {
            if (d > 0)d = speed.get();
            else d = -speed.get();
        }
        else d *= 0.01 * speed.get();

        delta.set(0);
        delta.set(d);
    }

    if (e.deltaX)
    {
        let dX = normalizeWheelX(e);
        dX *= 0.01 * speed.get();

        deltaX.set(0);
        deltaX.set(dX);
    }

    if (preventScroll.get()) e.preventDefault();
    trigger.trigger();
}

function updateArea()
{
    removeListener();

    if (area.get() == "Document") listenerElement = document;
    else if (area.get() == "Parent") listenerElement = cgl.canvas.parentElement;
    else listenerElement = cgl.canvas;

    if (active.get())addListener();
}

function addListener()
{
    if (!listenerElement)updateArea();
    listenerElement.addEventListener("wheel", onMouseWheel, { "passive": false });
}

function removeListener()
{
    if (listenerElement) listenerElement.removeEventListener("wheel", onMouseWheel);
}

active.onChange = function ()
{
    updateArea();
};

}
};






// **************************************************************
// 
// Ops.Math.DeltaSum
// 
// **************************************************************

Ops.Math.DeltaSum= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inVal = op.inFloat("Delta Value"),
    defVal = op.inValue("Default Value", 0),
    inMul = op.inValue("Multiply", 1),
    inReset = op.inTriggerButton("Reset"),
    inLimit = op.inValueBool("Limit", false),
    inMin = op.inValue("Min", 0),
    inMax = op.inValue("Max", 100),
    inRubber = op.inValue("Rubberband", 0),
    outVal = op.outNumber("Absolute Value");

inVal.changeAlways = true;

op.setPortGroup("Limit", [inLimit, inMin, inMax, inRubber]);

let value = 0;
let lastEvent = CABLES.now();
let rubTimeout = null;

inLimit.onChange = updateLimit;
defVal.onChange =
    inReset.onTriggered = resetValue;

inMax.onChange =
    inMin.onChange = updateValue;

updateLimit();

function resetValue()
{
    let v = defVal.get() || 0;

    if (inLimit.get())
    {
        v = Math.max(inMin.get(), v);
        v = Math.min(inMax.get(), v);
    }

    value = v;
    updateValue();

}

function updateLimit()
{
    inMin.setUiAttribs({ "greyout": !inLimit.get() });
    inMax.setUiAttribs({ "greyout": !inLimit.get() });
    inRubber.setUiAttribs({ "greyout": !inLimit.get() });

    updateValue();
}

function releaseRubberband()
{
    const min = inMin.get();
    const max = inMax.get();

    if (value < min) value = min;
    if (value > max) value = max;

    outVal.set(value);
}

function updateValue()
{
    if (inLimit.get())
    {
        const min = inMin.get();
        const max = inMax.get();
        const rubber = inRubber.get();
        const minr = inMin.get() - rubber;
        const maxr = inMax.get() + rubber;

        if (value < minr) value = minr;
        if (value > maxr) value = maxr;

        if (rubber !== 0.0)
        {
            clearTimeout(rubTimeout);
            rubTimeout = setTimeout(releaseRubberband.bind(this), 300);
        }
    }

    outVal.set(value);
}

inVal.onChange = function ()
{
    let v = parseFloat(inVal.get());

    const rubber = inRubber.get();

    if (inLimit.get())
        if (rubber !== 0.0)
        {
            const min = inMin.get();
            const max = inMax.get();
            const minr = inMin.get() - rubber;
            const maxr = inMax.get() + rubber;

            if (value < min)
            {
                const aa = Math.abs(value - minr) / rubber;
                v *= (aa * aa);
            }
            if (value > max)
            {
                const aa = Math.abs(maxr - value) / rubber;
                v *= (aa * aa);
            }
        }

    lastEvent = CABLES.now();
    value += v * inMul.get();
    updateValue();
};

}
};






// **************************************************************
// 
// Ops.Devices.Mobile.Pinch
// 
// **************************************************************

Ops.Devices.Mobile.Pinch= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// constants

const initialScale = 1.0;

// inputs
const enabledPort = op.inValueBool("Enabled", true);
const minScalePort = op.inValue("Min Scale", 0.0);
const maxScalePort = op.inValue("Max Scale", 4.0);
const resetScalePort = op.inTriggerButton("Reset Scale");
const inLimit = op.inBool("Limit", true);

// variables
let scale = initialScale;
let tmpScale = initialScale;
let pinchInProgress = false;

// setup
const el = op.patch.cgl.canvas;
const hammertime = new Hammer(el);
hammertime.get("pinch").set({ "enable": true });

// outputs
const scalePort = op.outNumber("Scale", 1);
const eventPort = op.outObject("Event Details");
const outDelta = op.outNumber("Delta");

// change listeners
window.addEventListener("gesturestart", (e) => { return e.preventDefault(); });
window.addEventListener("gesturechange", (e) => { return e.preventDefault(); });
window.addEventListener("gestureend", (e) => { return e.preventDefault(); });

hammertime.on("pinch", function (ev)
{
    op.log(ev.additionalEvent);
    ev.preventDefault(); // this is ignored in some browsers
    if (!enabledPort.get()) { return; }

    // if(ev.isFinal || ev.isFirst) { op.log(ev); }

    tmpScale = ev.scale;
    pinchInProgress = true;

    // if(ev.isFinal || !ev.isFinal && pinchInProgress) {
    const oldScale = scale;
    outDelta.set(0);

    if (ev.isFinal)
    {
        scale *= tmpScale;
        scale = checkAndCorrectBoundaries(scale);

        scalePort.set(scale);
        pinchInProgress = false;
        op.log("Final Pinch detected, resetting");
        tmpScale = initialScale;
    }
    else
    {
        scalePort.set(checkAndCorrectBoundaries(scale * tmpScale));
    }

    let d = oldScale - scalePort.get();
    if (d < 0) d = -1;
    else if (d > 0) d = 1;

    outDelta.set(d);

    // if(ev.additionalEvent) {
	    /*
	    if(ev.additionalEvent === 'pinchin') {
	        scale -=  Math.abs(ev.velocity);
	    } else if (ev.additionalEvent === 'pinchout') {
	        scale += Math.abs(ev.velocity);
	    }
	    */
    // }
    // scale += ev.velocity;
    /*
	op.log('ev.scale: ', ev.scale);
	tmpScale = ev.scale;

	var scaleToSet;
	if(ev.isFinal) {
	    scale *= tmpScale;
	    scaleToSet = scale;
	    tmpScale = initialScale;
	} else {
	    scaleToSet = scale * tmpScale;
	}

	op.log('scaleToSet', scaleToSet);

	scale = checkAndCorrectBoundaries(scale);
	scaleToSet = checkAndCorrectBoundaries(scaleToSet);

	scalePort.set(scaleToSet);
	*/
});

el.addEventListener("touchend", function (ev)
{
    op.log("touchend");
    if (pinchInProgress)
    {
        op.log("touchend, setting manually");
        ev.preventDefault(); // this is ignored in some browsers
        ev.stopPropagation();
        pinchInProgress = false;
        scale *= tmpScale;
        scale = checkAndCorrectBoundaries(scale);
        tmpScale = initialScale;
        scalePort.set(scale);
    }
});

function checkAndCorrectBoundaries(s)
{
    let correctedS = s;

    if (inLimit.get())
    {
        if (s < minScalePort.get())
        {
    	    correctedS = minScalePort.get();
    	}
        else if (s > maxScalePort.get())
        {
    	    correctedS = maxScalePort.get();
    	}
    }
    return correctedS;
}

resetScalePort.onTriggered = reset;

// functions

function reset()
{
    scale = initialScale;
    scalePort.set(scale);
}

}
};






// **************************************************************
// 
// Ops.WebAudio.Mixer
// 
// **************************************************************

Ops.WebAudio.Mixer= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const inAudio0 = op.inObject("Audio In 0", null, "audioNode");
const inAudio1 = op.inObject("Audio In 1", null, "audioNode");
const inAudio2 = op.inObject("Audio In 2", null, "audioNode");
const inAudio3 = op.inObject("Audio In 3", null, "audioNode");
const inAudio4 = op.inObject("Audio In 4", null, "audioNode");
const inAudio5 = op.inObject("Audio In 5", null, "audioNode");
const inAudio6 = op.inObject("Audio In 6", null, "audioNode");
const inAudio7 = op.inObject("Audio In 7", null, "audioNode");

const inAudio0Gain = op.inFloatSlider("In 0 Gain", 1);
const inAudio1Gain = op.inFloatSlider("In 1 Gain", 1);
const inAudio2Gain = op.inFloatSlider("In 2 Gain", 1);
const inAudio3Gain = op.inFloatSlider("In 3 Gain", 1);
const inAudio4Gain = op.inFloatSlider("In 4 Gain", 1);
const inAudio5Gain = op.inFloatSlider("In 5 Gain", 1);
const inAudio6Gain = op.inFloatSlider("In 6 Gain", 1);
const inAudio7Gain = op.inFloatSlider("In 7 Gain", 1);

const inAudio0Pan = op.inFloat("In 0 Pan", 0);
const inAudio1Pan = op.inFloat("In 1 Pan", 0);
const inAudio2Pan = op.inFloat("In 2 Pan", 0);
const inAudio3Pan = op.inFloat("In 3 Pan", 0);
const inAudio4Pan = op.inFloat("In 4 Pan", 0);
const inAudio5Pan = op.inFloat("In 5 Pan", 0);
const inAudio6Pan = op.inFloat("In 6 Pan", 0);
const inAudio7Pan = op.inFloat("In 7 Pan", 0);
const inMasterGain = op.inFloatSlider("Output Gain", 1);
const audioOut = op.outObject("Audio Out", null, "audioNode");

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
let useStereoPanner = !audioCtx.createPanner && audioCtx.createStereoPanner;
useStereoPanner = false;
const gain = audioCtx.createGain();
audioOut.set(gain);

const audioIns = [inAudio0, inAudio1, inAudio2, inAudio3, inAudio4, inAudio5, inAudio6, inAudio7];
const audioInGains = [inAudio0Gain, inAudio1Gain, inAudio2Gain, inAudio3Gain, inAudio4Gain, inAudio5Gain, inAudio6Gain, inAudio7Gain];
const audioInPans = [inAudio0Pan, inAudio1Pan, inAudio2Pan, inAudio3Pan, inAudio4Pan, inAudio5Pan, inAudio6Pan, inAudio7Pan];
op.setPortGroup("Audio Inputs", audioIns);
op.setPortGroup("Input", audioInGains);
op.setPortGroup("Panning", audioInPans);
op.setPortGroup("Output ", [inMasterGain]);
const oldAudioIns = audioIns.map(() =>
{
    return {
        "node": null,
        "isConnected": false
    };
});

audioInGains.forEach((port, index) =>
{
    port.gainNode = audioCtx.createGain();
    port.onChange = () => { return port.gainNode.gain.linearRampToValueAtTime((audioInGains[index].get() || 0), audioCtx.currentTime + 0.01); };
});

audioInPans.forEach((port, index) =>
{
    if (useStereoPanner)
    {
        port.panNode = audioCtx.createStereoPanner();
    }
    else
    {
        port.panNode = audioCtx.createPanner();
        port.panNode.panningModel = "equalpower";
    }

    port.panNode.connect(audioInGains[index].gainNode);

    port.onChange = () =>
    {
        const panning = CABLES.clamp(audioInPans[index].get(), -1, 1);
        if (useStereoPanner)
        {
            port.panNode.pan.linearRampToValueAtTime(panning, audioCtx.currentTime + 0.01);
        }
        else
        {
            port.panNode.positionX.linearRampToValueAtTime(panning, audioCtx.currentTime + 0.01);
            port.panNode.positionY.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
            port.panNode.positionZ.linearRampToValueAtTime(1 - Math.abs(panning), audioCtx.currentTime + 0.01);
        }
    };
});

audioIns.forEach((port, index) =>
{
    port.onChange = () =>
    {
        const audioNode = audioIns[index].get();
        try
        {
            if (audioNode)
            {
                if (audioNode.connect)
                {
                    const bufferedNode = oldAudioIns[index];
                    bufferedNode.node = audioNode;
                    const gainNodePort = audioInGains[index].gainNode;
                    const panNodePort = audioInPans[index].panNode;

                    if (!bufferedNode.isConnected)
                    {
                        bufferedNode.node.connect(panNodePort);
                        gainNodePort.connect(gain);
                        bufferedNode.isConnected = true;
                    }
                }
            }
            else
            {
                const bufferedNode = oldAudioIns[index];
                const gainNodePort = audioInGains[index].gainNode;
                const panNodePort = audioInPans[index].panNode;

                if (bufferedNode.isConnected)
                {
                    bufferedNode.node.disconnect(panNodePort);
                    gainNodePort.disconnect(gain);
                    bufferedNode.isConnected = false;
                }
            }
        }
        catch (e)
        {
            op.log(e);
        }
    };

    port.audioInPortNr = index;
});

inMasterGain.onChange = () => { return gain.gain.linearRampToValueAtTime((inMasterGain.get() || 0), audioCtx.currentTime + 0.01); };

op.onDelete = () =>
{
    for (let i = 0; i < audioInPans.length; i += 1)
    {
        audioInPans[i].panNode.disconnect();
    }
};

}
};






// **************************************************************
// 
// Ops.WebAudio.AudioBuffer_v2
// 
// **************************************************************

Ops.WebAudio.AudioBuffer_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const cgl = op.patch.cgl;

const
    audioCtx = CABLES.WEBAUDIO.createAudioContext(op),
    inUrlPort = op.inUrl("URL", "audio"),
    inLoadingTask = op.inBool("Create Loading Task", true),
    audioBufferPort = op.outObject("Audio Buffer", null, "audioBuffer"),
    finishedLoadingPort = op.outBoolNum("Finished Loading", false),
    sampleRatePort = op.outNumber("Sample Rate", 0),
    lengthPort = op.outNumber("Length", 0),
    durationPort = op.outNumber("Duration", 0),
    numberOfChannelsPort = op.outNumber("Number of Channels", 0),
    outLoading = op.outBool("isLoading", 0);

let currentBuffer = null;
let isLoading = false;
let currentFileUrl = null;
let urlToLoadNext = null;
let clearAfterLoad = false;
let fromData = false;
let fromDataNew = false;
let fileReader = new FileReader();
let arrayBuffer = null;
let loadingIdDataURL = 0;

if (!audioBufferPort.isLinked())
{
    op.setUiError("notConnected", "To play back sound, connect this op to a playback operator such as SamplePlayer or AudioBufferPlayer.", 0);
}
else
{
    op.setUiError("notConnected", null);
}

audioBufferPort.onLinkChanged = () =>
{
    if (audioBufferPort.isLinked())
    {
        op.setUiError("notConnected", null);
    }
    else
    {
        op.setUiError("notConnected", "To play back sound, connect this op to a playback operator such as SamplePlayer or AudioBufferPlayer.", 0);
    }
};

function loadAudioFile(url, loadFromData)
{
    currentFileUrl = url;
    isLoading = true;
    outLoading.set(isLoading);

    if (!loadFromData)
    {
        const ext = url.substr(url.lastIndexOf(".") + 1);
        if (ext === "wav")
        {
            op.setUiError("wavFormat", "You are using a .wav file. Make sure the .wav file is 16 bit to be supported by all browsers. Safari does not support 24 bit .wav files.", 1);
        }
        else
        {
            op.setUiError("wavFormat", null);
        }

        CABLES.WEBAUDIO.loadAudioFile(op.patch, url, onLoadFinished, onLoadFailed, inLoadingTask.get());
    }
    else
    {
        let fileBlob = dataURItoBlob(url);

        if (fileBlob.type === "audio/wav")
        {
            op.setUiError("wavFormat", "You are using a .wav file. Make sure the .wav file is 16 bit to be supported by all browsers. Safari does not support 24 bit .wav files.", 1);
        }
        else
        {
            op.setUiError("wavFormat", null);
        }

        if (inLoadingTask.get())
        {
            loadingIdDataURL = cgl.patch.loading.start("audiobuffer from data-url " + op.id, url, op);
            if (cgl.patch.isEditorMode()) gui.jobs().start({ "id": "loadaudio" + loadingIdDataURL, "title": " loading audio data url (" + op.id + ")" });
        }

        fileReader.readAsArrayBuffer(fileBlob);
    }
}

function dataURItoBlob(dataURI)
{
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    let byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    let ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    let ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (let i = 0; i < byteString.length; i++)
    {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    let blob = new Blob([ab], { "type": mimeString });
    return blob;
}

// change listeners
inUrlPort.onChange = function ()
{
    if (inUrlPort.get())
    {
        fromData = String(inUrlPort.get()).indexOf("data:") == 0;

        if (isLoading)
        {
            fromDataNew = String(inUrlPort.get()).indexOf("data:") == 0;
            const newUrl = fromDataNew ? inUrlPort.get() : op.patch.getFilePath(inUrlPort.get());
            if (newUrl !== currentFileUrl)
            {
                urlToLoadNext = newUrl;
            }
            else
            {
                urlToLoadNext = null;
            }

            clearAfterLoad = false;
            return;
        }

        invalidateOutPorts();
        const url = fromData ? inUrlPort.get() : op.patch.getFilePath(inUrlPort.get());

        loadAudioFile(url, fromData);
    }
    else
    {
        if (isLoading)
        {
            clearAfterLoad = true;
            return;
        }
        invalidateOutPorts();
        op.setUiError("wavFormat", null);
        op.setUiError("failedLoading", null);
    }
};

fileReader.onloadend = () =>
{
    arrayBuffer = fileReader.result;
    cgl.patch.loading.finished(loadingIdDataURL);
    if (cgl.patch.isEditorMode()) gui.jobs().finish("loadaudio" + loadingIdDataURL);
    loadFromDataURL();
};

function loadFromDataURL()
{
    if (arrayBuffer) audioCtx.decodeAudioData(arrayBuffer, onLoadFinished, onLoadFailed);
}

function onLoadFinished(buffer)
{
    isLoading = false;
    outLoading.set(isLoading);

    if (clearAfterLoad)
    {
        invalidateOutPorts();
        clearAfterLoad = false;
        return;
    }

    if (urlToLoadNext)
    {
        loadAudioFile(urlToLoadNext, fromDataNew);
        urlToLoadNext = null;
    }
    else
    {
        currentBuffer = buffer;
        lengthPort.set(buffer.length);
        durationPort.set(buffer.duration);
        numberOfChannelsPort.set(buffer.numberOfChannels);
        sampleRatePort.set(buffer.sampleRate);
        audioBufferPort.setRef(buffer);
        op.setUiError("failedLoading", null);
        finishedLoadingPort.set(true);
        fromData = false;
        fromDataNew = false;
    }
}

function onLoadFailed(e)
{
    // op.logError("Error: Loading audio file failed: ", e);
    op.setUiError("failedLoading", "The audio file could not be loaded. Make sure the right file URL is used.", 2);
    isLoading = false;
    invalidateOutPorts();
    outLoading.set(isLoading);
    currentBuffer = null;

    if (urlToLoadNext)
    {
        loadAudioFile(urlToLoadNext, fromDataNew);
        urlToLoadNext = null;
    }
}

function invalidateOutPorts()
{
    lengthPort.set(0);
    durationPort.set(0);
    numberOfChannelsPort.set(0);
    sampleRatePort.set(0);

    audioBufferPort.set(null);

    finishedLoadingPort.set(false);
}

}
};






// **************************************************************
// 
// Ops.Boolean.ToggleBool_v2
// 
// **************************************************************

Ops.Boolean.ToggleBool_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    trigger = op.inTriggerButton("trigger"),
    reset = op.inTriggerButton("reset"),
    inDefault = op.inBool("Default", false),
    next = op.outTrigger("Next"),
    outBool = op.outBoolNum("result");

let theBool = false;

op.onLoadedValueSet = () =>
{
    theBool = inDefault.get();
    outBool.set(inDefault.get());
    next.trigger();
};

trigger.onTriggered = function ()
{
    theBool = !theBool;
    outBool.set(theBool);
    next.trigger();
};

reset.onTriggered = function ()
{
    theBool = inDefault.get();
    outBool.set(theBool);
    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Anim.AnimNumber
// 
// **************************************************************

Ops.Anim.AnimNumber= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    inValue = op.inValue("Value"),
    duration = op.inValueFloat("duration"),
    next = op.outTrigger("Next"),
    result = op.outNumber("result"),
    finished = op.outTrigger("Finished");

let lastTime = 0;
let startTime = 0;
let offset = 0;
let firsttime = true;
duration.set(0.5);

const anim = new CABLES.Anim();
anim.createPort(op, "easing", init);
anim.loop = false;

duration.onChange =
    inValue.onChange = init;

function init()
{
    startTime = performance.now();
    anim.clear(CABLES.now() / 1000.0);

    if (firsttime) anim.setValue(CABLES.now() / 1000.0, inValue.get());

    anim.setValue(duration.get() + CABLES.now() / 1000.0, inValue.get(), triggerFinished);

    firsttime = false;
}

function triggerFinished()
{
    finished.trigger();
}

exe.onTriggered = function ()
{
    let t = CABLES.now() / 1000;

    if (performance.now() - lastTime > 300)
    {
        firsttime = true;
        init();
    }

    lastTime = performance.now();

    let v = anim.getValue(t);

    result.set(v);
    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Gl.ShaderEffects.VertexDisplacementMap_v5
// 
// **************************************************************

Ops.Gl.ShaderEffects.VertexDisplacementMap_v5= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"vertdisplace_body_vert":"\nvec2 MOD_tc=texCoord;\n\n#ifdef MOD_COORD_MESHXY\n    MOD_tc=pos.xy;\n#endif\n#ifdef MOD_COORD_MESHXZ\n    MOD_tc=pos.xz;\n#endif\n\n\n#ifdef MOD_FLIP_Y\n    MOD_tc.y=1.0-MOD_tc.y;\n#endif\n#ifdef MOD_FLIP_X\n    MOD_tc.x=1.0-MOD_tc.x;\n#endif\n#ifdef MOD_FLIP_XY\n    MOD_tc=1.0-MOD_tc;\n#endif\n\nMOD_tc*=MOD_scale;\n\nvec4 MOD_sample=texture( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) );\nvec3 MOD_disp;\n\n#ifdef MOD_INPUT_R\n    MOD_disp=vec3(MOD_sample.r);\n#endif\n#ifdef MOD_INPUT_G\n    MOD_disp=vec3(MOD_sample.g);\n#endif\n#ifdef MOD_INPUT_B\n    MOD_disp=vec3(MOD_sample.b);\n#endif\n#ifdef MOD_INPUT_A\n    MOD_disp=vec3(MOD_sample.a);\n#endif\n#ifdef MOD_INPUT_RGB\n    MOD_disp=MOD_sample.rgb;\n#endif\n#ifdef MOD_INPUT_LUMI\n    MOD_disp=vec3(dot(vec3(0.2126,0.7152,0.0722), MOD_sample.rgb));\n#endif\n\n\n\n#ifdef MOD_HEIGHTMAP_INVERT\n   MOD_disp=1.0-MOD_disp;\n#endif\n// #ifdef MOD_HEIGHTMAP_NORMALIZE\n//   MOD_disp-=0.5;\n//   MOD_disp*=2.0;\n// #endif\n\n\n#ifdef MOD_HEIGHTMAP_NORMALIZE\n    MOD_disp=(MOD_disp-0.5)*2.0;\n    // MOD_disp=(MOD_disp-0.5)*-1.0+0.5;\n#endif\n\n\nfloat MOD_zero=0.0;\n\n#ifdef MOD_MODE_DIV\n    MOD_zero=1.0;\n#endif\n#ifdef MOD_MODE_MUL\n    MOD_zero=1.0;\n#endif\n\n\n\nvec3 MOD_mask=vec3(1.0);\n\n#ifdef MOD_AXIS_X\n    MOD_mask=vec3(1.,0.,0.);\n    MOD_disp*=MOD_mask*MOD_extrude;\n#endif\n#ifdef MOD_AXIS_Y\n    MOD_mask=vec3(0.,1.,0.);\n    MOD_disp*=MOD_mask*MOD_extrude;\n#endif\n#ifdef MOD_AXIS_Z\n    MOD_mask=vec3(0.,0.,1.);\n    MOD_disp*=MOD_mask*MOD_extrude;\n#endif\n#ifdef MOD_AXIS_XY\n    MOD_mask=vec3(1.,1.,0.);\n    MOD_disp*=MOD_mask*MOD_extrude;\n#endif\n#ifdef MOD_AXIS_XYZ\n    MOD_mask=vec3(1.,1.,1.);\n    MOD_disp*=MOD_mask*MOD_extrude;\n#endif\n\n\n// MOD_disp=smoothstep(-1.,1.,MOD_disp*MOD_disp*MOD_disp);\n// MOD_disp=MOD_disp*MOD_disp*MOD_disp;\n\n// #ifdef MOD_FLIP_Y\n//     MOD_mask.y=1.0-MOD_mask.y;\n// #endif\n// #ifdef MOD_FLIP_X\n//     MOD_mask.x=1.0-MOD_mask.x;\n// #endif\n// #ifdef MOD_FLIP_XY\n//     MOD_mask.xy=1.0-MOD_mask.xy;\n// #endif\n\n\n\n#ifdef MOD_MODE_DIV\n    pos.xyz/=MOD_disp*MOD_mask;\n#endif\n\n#ifdef MOD_MODE_MUL\n    pos.xyz*=MOD_disp*MOD_mask;\n#endif\n\n#ifdef MOD_MODE_ADD\n    pos.xyz+=MOD_disp*MOD_mask;\n#endif\n\n#ifdef MOD_MODE_NORMAL\n\n    vec3 MOD_t=norm;\n    #ifdef MOD_SMOOTHSTEP\n        MOD_t=smoothstep(-1.,1.,MOD_t);\n    #endif\n\n    pos.xyz+=MOD_t*MOD_disp*MOD_mask;\n\n#endif\n\n#ifdef MOD_MODE_TANGENT\n    MOD_disp*=-1.0;\n\n    vec3 MOD_t=attrTangent;\n    #ifdef MOD_SMOOTHSTEP\n        MOD_t=smoothstep(-1.,1.,MOD_t);\n    #endif\n\n    pos.xyz+=MOD_t*MOD_disp*MOD_mask;\n\n#endif\n\n#ifdef MOD_MODE_BITANGENT\n    MOD_disp*=-1.0;\n    vec3 MOD_t=attrBiTangent;\n\n    #ifdef MOD_SMOOTHSTEP\n        MOD_t=smoothstep(-1.,1.,MOD_t);\n    #endif\n\n    pos.xyz+=MOD_t*MOD_disp*MOD_mask;\n\n#endif\n\n#ifdef MOD_MODE_VERTCOL\n    vec3 MOD_t=attrVertColor.rgb*vec3(2.0)-vec3(1.0);\n\n    #ifdef MOD_SMOOTHSTEP\n        MOD_t=smoothstep(-1.,1.,MOD_t);\n    #endif\n\n    pos.xyz+=MOD_t*MOD_disp*MOD_mask;\n\n#endif\n\n\n// pos.y*=-1.0;\n    // pos.xy+=vec2(MOD_texVal*MOD_extrude)*normalize(pos.xy);\n\n\nMOD_displHeightMapColor=MOD_disp;\n\n\n#ifdef MOD_CALC_NORMALS\n    vec3 MOD_norm = MOD_calcNormal(MOD_texture,MOD_tc);\n    norm = mix(norm, norm+MOD_norm, MOD_extrude);\n    norm = normalize(norm);\n#endif\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n","vertdisplace_head_vert":"OUT vec3 MOD_displHeightMapColor;\n\n#ifdef MOD_MODE_VERTCOL\n#ifndef VERTEX_COLORS\nIN vec4 attrVertColor;\n#endif\n#endif\n\n// mat4 rotationX( in float angle ) {\n// \treturn mat4(\t1.0,\t\t0,\t\t\t0,\t\t\t0,\n// \t\t\t \t\t0, \tcos(angle),\t-sin(angle),\t\t0,\n// \t\t\t\t\t0, \tsin(angle),\t cos(angle),\t\t0,\n// \t\t\t\t\t0, \t\t\t0,\t\t\t  0, \t\t1);\n// }\n\n// mat4 rotationY( in float angle ) {\n// \treturn mat4(\tcos(angle),\t\t0,\t\tsin(angle),\t0,\n// \t\t\t \t\t\t\t0,\t\t1.0,\t\t\t 0,\t0,\n// \t\t\t\t\t-sin(angle),\t0,\t\tcos(angle),\t0,\n// \t\t\t\t\t\t\t0, \t\t0,\t\t\t\t0,\t1);\n// }\n\n// mat4 rotationZ( in float angle ) {\n// \treturn mat4(\tcos(angle),\t\t-sin(angle),\t0,\t0,\n// \t\t\t \t\tsin(angle),\t\tcos(angle),\t\t0,\t0,\n// \t\t\t\t\t\t\t0,\t\t\t\t0,\t\t1,\t0,\n// \t\t\t\t\t\t\t0,\t\t\t\t0,\t\t0,\t1);\n// }\n\n\nvec3 MOD_calcNormal(sampler2D tex,vec2 uv)\n{\n    // float texelSize=1.0/float(textureSize(tex,0).x); // not on linux intel?!\n    float texelSize=1.0/512.0;\n\n    float tl = abs(texture(tex, uv + texelSize * vec2(-1.0, -1.0)).x);   // top left\n    float  l = abs(texture(tex, uv + texelSize * vec2(-1.0,  0.0)).x);   // left\n    float bl = abs(texture(tex, uv + texelSize * vec2(-1.0,  1.0)).x);   // bottom left\n    float  t = abs(texture(tex, uv + texelSize * vec2( 0.0, -1.0)).x);   // top\n    float  b = abs(texture(tex, uv + texelSize * vec2( 0.0,  1.0)).x);   // bottom\n    float tr = abs(texture(tex, uv + texelSize * vec2( 1.0, -1.0)).x);   // top right\n    float  r = abs(texture(tex, uv + texelSize * vec2( 1.0,  0.0)).x);   // right\n    float br = abs(texture(tex, uv + texelSize * vec2( 1.0,  1.0)).x);   // bottom right\n\n    //     // Compute dx using Sobel:\n    //     //           -1 0 1\n    //     //           -2 0 2\n    //     //           -1 0 1\n    float dX = tr + 2.0 * r + br - tl - 2.0 * l - bl;\n    //     // Compute dy using Sobel:\n    //     //           -1 -2 -1\n    //     //            0  0  0\n    //     //            1  2  1\n    float dY = bl + 2.0*b + br -tl - 2.0*t - tr;\n    //  // Build the normalized normal\n\nvec3 N;\n\n#ifdef MOD_NORMALS_Z\n    N = (vec3(dX,dY, 1.0 / 8.0));\n#endif\n\n#ifdef MOD_NORMALS_Y\n    N = (vec3(dX,1.0/8.0,dY));\n#endif\n#ifdef MOD_NORMALS_X\n    N = (vec3(1.0/8.0,dX,dY));\n#endif\n//N*=-1.0;\n// N= N * 0.5 + 0.5;\n\n\n   return N;\n}\n",};
const
    render = op.inTrigger("Render"),
    extrude = op.inValue("Extrude", 0.5),
    meth = op.inSwitch("Mode", ["Norm", "Tang", "BiTang", "VertCol", "*", "+", "/"], "Norm"),
    axis = op.inSwitch("Axis", ["XYZ", "XY", "X", "Y", "Z"], "XYZ"),
    src = op.inSwitch("Coordinates", ["Tex Coords", "Mesh XY", "Mesh XZ"], "Tex Coords"),

    texture = op.inTexture("Texture", null, "texture"),
    channel = op.inSwitch("Channel", ["Luminance", "R", "G", "B", "A", "RGB"], "Luminance"),
    flip = op.inSwitch("Flip", ["None", "X", "Y", "XY"], "None"),
    range = op.inSwitch("Range", ["0-1", "1-0", "Normalized"], "0-1"),
    offsetX = op.inValueFloat("Offset X"),
    offsetY = op.inValueFloat("Offset Y"),
    scale = op.inValueFloat("Scale", 1),

    calcNormals = op.inValueBool("Calc Normals", false),
    calcNormalsAxis = op.inSwitch("Normal Axis", ["X", "Y", "Z"], "Z"),
    removeZero = op.inValueBool("Discard Zero Values"),
    colorize = op.inValueBool("colorize", false),
    colorizeMin = op.inValueSlider("Colorize Min", 0),
    colorizeMax = op.inValueSlider("Colorize Max", 1),
    next = op.outTrigger("trigger");

const cgl = op.patch.cgl;

op.setPortGroup("Input", [texture, flip, channel, range, offsetX, offsetY, scale]);
op.setPortGroup("Colorize", [colorize, colorizeMin, colorizeMax, removeZero]);

op.toWorkPortsNeedToBeLinked(texture, next, render);

render.onTriggered = dorender;

channel.onChange =
    src.onChange =
    axis.onChange =
    flip.onChange =
    meth.onChange =
    range.onChange =
    colorize.onChange =
    removeZero.onChange =
    calcNormals.onChange =
    calcNormalsAxis.onChange = updateDefines;

const srcHeadVert = attachments.vertdisplace_head_vert;
const srcBodyVert = attachments.vertdisplace_body_vert;

const srcHeadFrag = ""
    .endl() + "IN vec3 MOD_displHeightMapColor;"
    .endl() + "vec3 MOD_map(vec3 value, float inMin, float inMax, float outMin, float outMax) { return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);}"

    .endl();

const srcBodyFrag = ""
    .endl() + "#ifdef MOD_HEIGHTMAP_COLORIZE"
    .endl() + "   col.rgb*=MOD_map( MOD_displHeightMapColor, 0.0,1.0 , MOD_colorizeMin,MOD_colorizeMax);"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_DISPLACE_REMOVE_ZERO"
    .endl() + "   if(MOD_displHeightMapColor.r==0.0)discard;"
    .endl() + "#endif"
    .endl();

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": srcBodyVert
});

mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    "srcHeadFrag": srcHeadFrag,
    "srcBodyFrag": srcBodyFrag
});

mod.addUniformVert("t", "MOD_texture", 0);
mod.addUniformVert("f", "MOD_extrude", extrude);
mod.addUniformVert("f", "MOD_offsetX", offsetX);
mod.addUniformVert("f", "MOD_offsetY", offsetY);
mod.addUniformVert("f", "MOD_scale", scale);

mod.addUniformFrag("f", "MOD_colorizeMin", colorizeMin);
mod.addUniformFrag("f", "MOD_colorizeMax", colorizeMax);

updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_HEIGHTMAP_COLORIZE", colorize.get());

    mod.toggleDefine("MOD_HEIGHTMAP_INVERT", range.get() == "1-0");
    mod.toggleDefine("MOD_HEIGHTMAP_NORMALIZE", range.get() == "Normalized");

    mod.toggleDefine("MOD_DISPLACE_REMOVE_ZERO", removeZero.get());

    mod.toggleDefine("MOD_INPUT_R", channel.get() == "R");
    mod.toggleDefine("MOD_INPUT_G", channel.get() == "G");
    mod.toggleDefine("MOD_INPUT_B", channel.get() == "B");
    mod.toggleDefine("MOD_INPUT_A", channel.get() == "A");
    mod.toggleDefine("MOD_INPUT_RGB", channel.get() == "RGB");
    mod.toggleDefine("MOD_INPUT_LUMI", channel.get() == "Luminance");

    mod.toggleDefine("MOD_FLIP_X", flip.get() == "X");
    mod.toggleDefine("MOD_FLIP_Y", flip.get() == "Y");
    mod.toggleDefine("MOD_FLIP_XY", flip.get() == "XY");

    mod.toggleDefine("MOD_AXIS_X", axis.get() == "X");
    mod.toggleDefine("MOD_AXIS_Y", axis.get() == "Y");
    mod.toggleDefine("MOD_AXIS_Z", axis.get() == "Z");
    mod.toggleDefine("MOD_AXIS_XYZ", axis.get() == "XYZ");
    mod.toggleDefine("MOD_AXIS_XY", axis.get() == "XY");

    mod.toggleDefine("MOD_MODE_BITANGENT", meth.get() == "BiTang");
    mod.toggleDefine("MOD_MODE_TANGENT", meth.get() == "Tang");
    mod.toggleDefine("MOD_MODE_NORMAL", meth.get() == "Norm");
    mod.toggleDefine("MOD_MODE_VERTCOL", meth.get() == "VertCol");
    mod.toggleDefine("MOD_MODE_MUL", meth.get() == "*");
    mod.toggleDefine("MOD_MODE_ADD", meth.get() == "+");
    mod.toggleDefine("MOD_MODE_DIV", meth.get() == "/");
    mod.toggleDefine("MOD_SMOOTHSTEP", 0);

    mod.toggleDefine("MOD_COORD_TC", src.get() == "Tex Coords");
    mod.toggleDefine("MOD_COORD_MESHXY", src.get() == "Mesh XY");
    mod.toggleDefine("MOD_COORD_MESHXZ", src.get() == "Mesh XZ");

    mod.toggleDefine("MOD_CALC_NORMALS", calcNormals.get());
    mod.toggleDefine("MOD_NORMALS_X", calcNormalsAxis.get() == "X");
    mod.toggleDefine("MOD_NORMALS_Y", calcNormalsAxis.get() == "Y");
    mod.toggleDefine("MOD_NORMALS_Z", calcNormalsAxis.get() == "Z");

    calcNormalsAxis.setUiAttribs({ "greyout": !calcNormals.get() });
}

function dorender()
{
    mod.bind();

    if (texture.get() && !texture.get().deleted) mod.pushTexture("MOD_texture", texture.get());
    else mod.pushTexture("MOD_texture", CGL.Texture.getEmptyTexture(cgl));

    next.trigger();

    mod.unbind();
}

}
};






// **************************************************************
// 
// Ops.Gl.Phong.SpotLight_v5
// 
// **************************************************************

Ops.Gl.Phong.SpotLight_v5= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const cgl = op.patch.cgl;

// * OP START *
const inTrigger = op.inTrigger("Trigger In");

const inCastLight = op.inBool("Cast Light", true);
const inIntensity = op.inFloat("Intensity", 2);
const inRadius = op.inFloat("Radius", 10);

const inPosX = op.inFloat("X", 1);
const inPosY = op.inFloat("Y", 3);
const inPosZ = op.inFloat("Z", 1);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

const inPointAtX = op.inFloat("Point At X", 0);
const inPointAtY = op.inFloat("Point At Y", 0);
const inPointAtZ = op.inFloat("Point At Z", 0);
const pointAtIn = [inPointAtX, inPointAtY, inPointAtZ];
op.setPortGroup("Point At", pointAtIn);

const inR = op.inFloatSlider("R", 1);
const inG = op.inFloatSlider("G", 1);
const inB = op.inFloatSlider("B", 1);
inR.setUiAttribs({ "colorPick": true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloatSlider("Specular R", 1);
const inSpecularG = op.inFloatSlider("Specular G", 1);
const inSpecularB = op.inFloatSlider("Specular B", 1);
inSpecularR.setUiAttribs({ "colorPick": true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inConeAngle = op.inFloat("Cone Angle", 120);
const inConeAngleInner = op.inFloat("Inner Cone Angle", 60);
const inSpotExponent = op.inFloat("Spot Exponent", 0.97);
const coneAttribsIn = [inConeAngle, inConeAngleInner, inSpotExponent];
op.setPortGroup("Cone Attributes", coneAttribsIn);

const inFalloff = op.inFloatSlider("Falloff", 0.00001);
const lightAttribsIn = [inCastLight, inIntensity, inRadius];
op.setPortGroup("Light Attributes", lightAttribsIn);

const inCastShadow = op.inBool("Cast Shadow", false);
const inRenderMapActive = op.inBool("Rendering Active", true);
const inMapSize = op.inSwitch("Map Size", [256, 512, 1024, 2048], 512);
const inShadowStrength = op.inFloatSlider("Shadow Strength", 0.99);
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBias = op.inFloatSlider("Bias", 0.0001);
const inPolygonOffset = op.inInt("Polygon Offset", 0);
const inNormalOffset = op.inFloatSlider("Normal Offset", 0);
const inBlur = op.inFloatSlider("Blur Amount", 0);
op.setPortGroup("", [inCastShadow]);
op.setPortGroup("Shadow Map Settings", [
    inMapSize,
    inRenderMapActive,
    inShadowStrength,
    inNear,
    inFar,
    inBias,
    inPolygonOffset,
    inNormalOffset,
    inBlur
]);

inMapSize.setUiAttribs({ "greyout": true, "hidePort": true });
inRenderMapActive.setUiAttribs({ "greyout": true });
inShadowStrength.setUiAttribs({ "greyout": true });
inNear.setUiAttribs({ "greyout": true, "hidePort": true });
inFar.setUiAttribs({ "greyout": true, "hidePort": true });
inBlur.setUiAttribs({ "greyout": true, "hidePort": true });
inPolygonOffset.setUiAttribs({ "greyout": true, "hidePort": true });
inNormalOffset.setUiAttribs({ "greyout": true, "hidePort": true });
inBias.setUiAttribs({ "greyout": true, "hidePort": true });

const inAdvanced = op.inBool("Enable Advanced", false);
const inMSAA = op.inSwitch("MSAA", ["none", "2x", "4x", "8x"], "none");
const inFilterType = op.inSwitch("Texture Filter", ["Linear", "Nearest", "Mip Map"], "Linear");
const inAnisotropic = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], "0");
inMSAA.setUiAttribs({ "greyout": true, "hidePort": true });
inFilterType.setUiAttribs({ "greyout": true, "hidePort": true });
inAnisotropic.setUiAttribs({ "greyout": true, "hidePort": true });
op.setPortGroup("Advanced Options", [inAdvanced, inMSAA, inFilterType, inAnisotropic]);

let updating = false;

inAdvanced.setUiAttribs({ "hidePort": true });

inAdvanced.onChange = function ()
{
    inMSAA.setUiAttribs({ "greyout": !inAdvanced.get() });
    inFilterType.setUiAttribs({ "greyout": !inAdvanced.get() });
    inAnisotropic.setUiAttribs({ "greyout": !inAdvanced.get() });
};

const outTrigger = op.outTrigger("Trigger Out");
const outTexture = op.outTexture("Shadow Map");
const outWorldPosX = op.outNumber("World Position X");
const outWorldPosY = op.outNumber("World Position Y");
const outWorldPosZ = op.outNumber("World Position Z");

const newLight = new CGL.Light(cgl, {
    "type": "spot",
    "position": [0, 1, 2].map(function (i) { return positionIn[i].get(); }),
    "color": [0, 1, 2].map(function (i) { return colorIn[i].get(); }),
    "specular": [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); }),
    "conePointAt": [0, 1, 2].map(function (i) { return pointAtIn[i].get(); }),
    "intensity": inIntensity.get(),
    "radius": inRadius.get(),
    "falloff": inFalloff.get(),
    "cosConeAngleInner": Math.cos(CGL.DEG2RAD * inConeAngleInner.get()),
    "cosConeAngle": Math.cos(CGL.DEG2RAD * inConeAngle.get()),
    "spotExponent": inSpotExponent.get(),
    "castShadow": false,
    "shadowStrength": inShadowStrength.get(),
    "shadowBias": inBias.get(),
    "normalOffset": inNormalOffset.get(),
});
newLight.castLight = inCastLight.get();

let updateLight = false;
inR.onChange = inG.onChange = inB.onChange = inSpecularR.onChange = inSpecularG.onChange = inSpecularB.onChange
= inPointAtX.onChange = inPointAtY.onChange = inPointAtZ.onChange = inPosX.onChange = inPosY.onChange = inPosZ.onChange;
inCastLight.onChange = inIntensity.onChange = inRadius.onChange = inFalloff.onChange = inConeAngle.onChange = inConeAngleInner.onChange
= inSpotExponent.onChange = inShadowStrength.onChange = inNear.onChange = inFar.onChange = updateLightParameters;

function updateLightParameters()
{
    updateLight = true;
}

inCastShadow.onChange = function ()
{
    updating = true;
    const castShadow = inCastShadow.get();

    inMapSize.setUiAttribs({ "greyout": !castShadow });
    inRenderMapActive.setUiAttribs({ "greyout": !castShadow });
    inShadowStrength.setUiAttribs({ "greyout": !castShadow });
    inNear.setUiAttribs({ "greyout": !castShadow });
    inFar.setUiAttribs({ "greyout": !castShadow });
    inNormalOffset.setUiAttribs({ "greyout": !castShadow });
    inBlur.setUiAttribs({ "greyout": !castShadow });
    inBias.setUiAttribs({ "greyout": !castShadow });
    inPolygonOffset.setUiAttribs({ "greyout": !castShadow });

    updateLight = true;
};

let texelSize = 1 / Number(inMapSize.get());

function updateBuffers()
{
    const MSAA = Number(inMSAA.get().charAt(0));

    let filterType = null;
    const anisotropyFactor = Number(inAnisotropic.get());

    if (inFilterType.get() == "Linear")
    {
        filterType = CGL.Texture.FILTER_LINEAR;
    }
    else if (inFilterType.get() == "Nearest")
    {
        filterType = CGL.Texture.FILTER_NEAREST;
    }
    else if (inFilterType.get() == "Mip Map")
    {
        filterType = CGL.Texture.FILTER_MIPMAP;
    }

    const mapSize = Number(inMapSize.get());
    const textureOptions = {
        "isFloatingPointTexture": true,
        "filter": filterType,
    };

    if (MSAA) Object.assign(textureOptions, { "multisampling": true, "multisamplingSamples": MSAA });
    Object.assign(textureOptions, { "anisotropic": anisotropyFactor });

    newLight.createFramebuffer(mapSize, mapSize, textureOptions);
    newLight.createBlurEffect(textureOptions);
}

inMSAA.onChange = inAnisotropic.onChange = inFilterType.onChange = inMapSize.onChange = function ()
{
    updating = true;
};

function updateShadowMapFramebuffer()
{
    const size = Number(inMapSize.get());
    texelSize = 1 / size;

    if (inCastShadow.get())
    {
        newLight.createFramebuffer(Number(inMapSize.get()), Number(inMapSize.get()), {});
        newLight.createShadowMapShader();
        newLight.createBlurEffect({});
        newLight.createBlurShader();
        newLight.updateProjectionMatrix(null, inNear.get(), inFar.get(), inConeAngle.get());
    }

    if (inAdvanced.get()) updateBuffers();

    updating = false;
}

const position = vec3.create();
const pointAtPos = vec3.create();
const resultPos = vec3.create();
const resultPointAt = vec3.create();

function drawHelpers()
{
    if (cgl.tempData.shadowPass) return;
    if (cgl.shouldDrawHelpers(op))
    {
        gui.setTransformGizmo({
            "posX": inPosX,
            "posY": inPosY,
            "posZ": inPosZ,
        });
        gui.setTransformGizmo({
            "posX": inPointAtX,
            "posY": inPointAtY,
            "posZ": inPointAtZ,
        }, 1);

        CABLES.GL_MARKER.drawLineSourceDest(
            op,
            newLight.position[0],
            newLight.position[1],
            newLight.position[2],
            newLight.conePointAt[0],
            newLight.conePointAt[1],
            newLight.conePointAt[2],
        );
    }
}

let errorActive = false;
inTrigger.onTriggered = renderLight;

op.preRender = () =>
{
    updateShadowMapFramebuffer();
    renderLight();
};

function renderLight()
{
    if (updating)
    {
        if (cgl.tempData.shadowPass) return;
        updateShadowMapFramebuffer();
    }

    if (!cgl.tempData.shadowPass)
    {
        if (!newLight.isUsed && !errorActive)
        {
            op.setUiError("lightUsed", "No operator is using this light. Make sure this op is positioned before an operator that uses lights. Also make sure there is an operator that uses lights after this.", 1); // newLight.isUsed = false;
            errorActive = true;
        }
        else if (!newLight.isUsed && errorActive) {}
        else if (newLight.isUsed && errorActive)
        {
            op.setUiError("lightUsed", null);
            errorActive = false;
        }
        else if (newLight.isUsed && !errorActive) {}
        newLight.isUsed = false;
    }

    if (updateLight)
    {
        newLight.position = [0, 1, 2].map(function (i) { return positionIn[i].get(); });
        newLight.color = [0, 1, 2].map(function (i) { return colorIn[i].get(); });
        newLight.specular = [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); });
        newLight.conePointAt = [0, 1, 2].map(function (i) { return pointAtIn[i].get(); });
        newLight.intensity = inIntensity.get();
        newLight.castLight = inCastLight.get();
        newLight.radius = inRadius.get();
        newLight.falloff = inFalloff.get();
        newLight.cosConeAngleInner = Math.cos(CGL.DEG2RAD * inConeAngleInner.get());
        newLight.cosConeAngle = Math.cos(CGL.DEG2RAD * inConeAngle.get());
        newLight.spotExponent = inSpotExponent.get();
        newLight.castShadow = inCastShadow.get();
        newLight.updateProjectionMatrix(null, inNear.get(), inFar.get(), inConeAngle.get());
    }

    if (!cgl.tempData.lightStack) cgl.tempData.lightStack = [];

    vec3.set(position, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.set(pointAtPos, inPointAtX.get(), inPointAtY.get(), inPointAtZ.get());

    vec3.transformMat4(resultPos, position, cgl.mMatrix);
    vec3.transformMat4(resultPointAt, pointAtPos, cgl.mMatrix);

    newLight.position = resultPos;
    newLight.conePointAt = resultPointAt;

    outWorldPosX.set(newLight.position[0]);
    outWorldPosY.set(newLight.position[1]);
    outWorldPosZ.set(newLight.position[2]);

    if (!cgl.tempData.shadowPass) drawHelpers();

    cgl.tempData.lightStack.push(newLight);

    if (inCastShadow.get())
    {
        const blurAmount = 1.5 * inBlur.get() * texelSize;
        if (inRenderMapActive.get()) newLight.renderPasses(inPolygonOffset.get(), blurAmount, function () { outTrigger.trigger(); });
        // outTexture.set(null);
        outTexture.setRef(newLight.getShadowMapDepth());

        // remove light from stack and readd it with shadow map & mvp matrix
        cgl.tempData.lightStack.pop();

        newLight.castShadow = inCastShadow.get();
        newLight.blurAmount = inBlur.get();
        newLight.normalOffset = inNormalOffset.get();
        newLight.shadowBias = inBias.get();
        newLight.shadowStrength = inShadowStrength.get();
        cgl.tempData.lightStack.push(newLight);
    }

    outTrigger.trigger();

    cgl.tempData.lightStack.pop();
}

}
};






// **************************************************************
// 
// Ops.Gl.Phong.PointLight_v5
// 
// **************************************************************

Ops.Gl.Phong.PointLight_v5= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const cgl = op.patch.cgl;
const gl = cgl.gl;
const mesh = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");

function Light(config)
{
    this.type = config.type || "point";
    this.color = config.color || [1, 1, 1];
    this.specular = config.specular || [0, 0, 0];
    this.position = config.position || null;
    this.intensity = config.intensity || 1;
    this.radius = config.radius || 1;
    this.falloff = config.falloff || 1;
    this.spotExponent = config.spotExponent || 1;
    this.cosConeAngle = Math.cos(CGL.DEG2RAD * this.coneAngle);
    this.conePointAt = config.conePointAt || [0, 0, 0];
    this.castShadow = config.castShadow || false;
    return this;
}

// * OP START *
const inTrigger = op.inTrigger("Trigger In");
const inCastLight = op.inBool("Cast Light", true);
const inIntensity = op.inFloat("Intensity", 2);
const inRadius = op.inFloat("Radius", 15);

const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 2);
const inPosZ = op.inFloat("Z", 0.75);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

const inR = op.inFloat("R", 0.8);
const inG = op.inFloat("G", 0.8);
const inB = op.inFloat("B", 0.8);

inR.setUiAttribs({ "colorPick": true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloat("Specular R", 1);
const inSpecularG = op.inFloat("Specular G", 1);
const inSpecularB = op.inFloat("Specular B", 1);

inSpecularR.setUiAttribs({ "colorPick": true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inFalloff = op.inFloatSlider("Falloff", 0.5);

const attribIns = [inIntensity, inCastLight, inRadius];
op.setPortGroup("Light Attributes", attribIns);

const inCastShadow = op.inBool("Cast Shadow", false);
const inRenderMapActive = op.inBool("Rendering Active", true);
const inMapSize = op.inSwitch("Map Size", [256, 512, 1024, 2048], 512);
const inShadowStrength = op.inFloatSlider("Shadow Strength", 1);
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBias = op.inFloatSlider("Bias", 0.004);
const inPolygonOffset = op.inInt("Polygon Offset", 0);
op.setPortGroup("", [inCastShadow]);
op.setPortGroup("Shadow Map Settings", [inMapSize, inRenderMapActive, inShadowStrength, inNear, inFar, inBias, inPolygonOffset]);
const shadowProperties = [inNear, inFar];
inMapSize.setUiAttribs({ "greyout": !inCastShadow.get() });
inRenderMapActive.setUiAttribs({ "greyout": !inCastShadow.get() });
inShadowStrength.setUiAttribs({ "greyout": !inCastShadow.get() });
inNear.setUiAttribs({ "greyout": !inCastShadow.get() });
inBias.setUiAttribs({ "greyout": !inCastShadow.get() });
inFar.setUiAttribs({ "greyout": !inCastShadow.get() });
inPolygonOffset.setUiAttribs({ "greyout": !inCastShadow.get() });

let updating = false;

inCastShadow.onChange = function ()
{
    updating = true;
    updateLight = true;

    inMapSize.setUiAttribs({ "greyout": !inCastShadow.get() });
    inRenderMapActive.setUiAttribs({ "greyout": !inCastShadow.get() });
    inShadowStrength.setUiAttribs({ "greyout": !inCastShadow.get() });
    inNear.setUiAttribs({ "greyout": !inCastShadow.get() });
    inFar.setUiAttribs({ "greyout": !inCastShadow.get() });
    inBias.setUiAttribs({ "greyout": !inCastShadow.get() });
    inPolygonOffset.setUiAttribs({ "greyout": !inCastShadow.get() });
};

const outTrigger = op.outTrigger("Trigger Out");
const outCubemap = op.outObject("Cubemap", null, "texture");
const outWorldPosX = op.outNumber("World Position X");
const outWorldPosY = op.outNumber("World Position Y");
const outWorldPosZ = op.outNumber("World Position Z");

const newLight = new CGL.Light(cgl, {
    "type": "point",
    "position": [0, 1, 2].map(function (i) { return positionIn[i].get(); }),
    "color": [0, 1, 2].map(function (i) { return colorIn[i].get(); }),
    "specular": [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); }),
    "intensity": inIntensity.get(),
    "radius": inRadius.get(),
    "falloff": inFalloff.get(),
    "shadowStrength": inShadowStrength.get(),
    "shadowBias": inBias.get()
});
newLight.castLight = inCastLight.get();

let updateLight = false;

inPosX.onChange = inPosY.onChange = inPosZ.onChange = inR.onChange = inG.onChange = inB.onChange
= inSpecularR.onChange = inSpecularG.onChange = inSpecularB.onChange = inIntensity.onChange
= inCastLight.onChange = inRadius.onChange = inFalloff.onChange = inNear.onChange = inFar.onChange = inShadowStrength.onChange = function ()
        {
            updateLight = true;
        };

inMapSize.onChange = function ()
{
    // TODO: update this one
    updating = true;
};

function updateShadowMapFramebuffer()
{
    if (inCastShadow.get())
    {
        const size = inMapSize.get();
        newLight.createFramebuffer(size, size, {});
        newLight.createShadowMapShader();
    }
    updating = false;
}

const sc = vec3.create();
const result = vec3.create();
const position = vec3.create();
const transVec = vec3.create();

function drawHelpers()
{
    if (cgl.tempData.shadowPass) return;

    if (CABLES.UI) gui.setTransform(op.id, inPosX.get(), inPosY.get(), inPosZ.get());
    if (op.isCurrentUiOp())
    {
        gui.setTransformGizmo({
            "posX": inPosX,
            "posY": inPosY,
            "posZ": inPosZ,
        });

        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, transVec);
        CABLES.GL_MARKER.drawSphere(op, inRadius.get());
        cgl.popModelMatrix();
    }
}

let errorActive = false;

inTrigger.onTriggered = function ()
{
    if (updating)
    {
        if (cgl.tempData.shadowPass) return;
        updateShadowMapFramebuffer();
    }

    if (!cgl.tempData.shadowPass)
    {
        if (!newLight.isUsed && !errorActive)
        {
            op.setUiError("lightUsed", "No operator is using this light. Make sure this op is positioned before an operator that uses lights. Also make sure there is an operator that uses lights after this.", 1); // newLight.isUsed = false;
            errorActive = true;
        }
        else if (!newLight.isUsed && errorActive) {}
        else if (newLight.isUsed && errorActive)
        {
            op.setUiError("lightUsed", null);
            errorActive = false;
        }
        else if (newLight.isUsed && !errorActive) {}

        newLight.isUsed = false;
    }

    if (updateLight)
    {
        newLight.position = [0, 1, 2].map(function (i) { return positionIn[i].get(); });
        newLight.color = [0, 1, 2].map(function (i) { return colorIn[i].get(); });
        newLight.specular = [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); });
        newLight.intensity = inIntensity.get();
        newLight.radius = inRadius.get();
        newLight.falloff = inFalloff.get();
        newLight.castShadow = inCastShadow.get();
        newLight.castLight = inCastLight.get();
        newLight.updateProjectionMatrix(null, inNear.get(), inFar.get(), null);
        updateLight = false;
    }

    if (!cgl.tempData.lightStack) cgl.tempData.lightStack = [];

    vec3.set(transVec, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.transformMat4(position, transVec, cgl.mMatrix);

    newLight.position = position;

    outWorldPosX.set(newLight.position[0]);
    outWorldPosY.set(newLight.position[1]);
    outWorldPosZ.set(newLight.position[2]);

    if (!cgl.tempData.shadowPass) drawHelpers();

    cgl.tempData.lightStack.push(newLight);

    if (inCastShadow.get())
    {
        if (inRenderMapActive.get()) newLight.renderPasses(inPolygonOffset.get(), null, function () { outTrigger.trigger(); });

        if (!cgl.tempData.shadowPass)
        {
            cgl.tempData.lightStack.pop();
            newLight.castShadow = inCastShadow.get();
            newLight.shadowBias = inBias.get();
            newLight.shadowStrength = inShadowStrength.get();

            if (newLight.shadowCubeMap)
            {
                if (newLight.shadowCubeMap.cubemap)
                {
                    outCubemap.set(null);
                    outCubemap.set(newLight.shadowCubeMap);
                    if (inRenderMapActive.get())
                    {
                        // needs to be "cloned", cannot save reference.
                        newLight.positionForShadowMap = [newLight.position[0], newLight.position[1], newLight.position[2]];
                    }
                }
            }
            cgl.tempData.lightStack.push(newLight);
        }
    }
    else
    {
        outCubemap.set(null);
    }

    outTrigger.trigger();
    cgl.tempData.lightStack.pop();
};

}
};






// **************************************************************
// 
// Ops.Html.CSS.ElementCssColor
// 
// **************************************************************

Ops.Html.CSS.ElementCssColor= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inEle = op.inObject("Element", null, "element"),
    inSetCol = op.inBool("Set Color", true),
    r = op.inFloatSlider("Color R", 0),
    g = op.inFloatSlider("Color G", 0),
    b = op.inFloatSlider("Color B", 0),
    a = op.inFloatSlider("Color A", 1),
    inSetBg = op.inBool("Set Background", true),
    bgr = op.inFloatSlider("Background Color R", 1),
    bgg = op.inFloatSlider("Background Color G", 1),
    bgb = op.inFloatSlider("Background Color B", 1),
    bga = op.inFloatSlider("Background Color A", 1),
    outEle = op.outObject("HTML Element", null, "element");

r.setUiAttribs({ "colorPick": true });
bgr.setUiAttribs({ "colorPick": true });

let ele = null;

inEle.onChange =
    inSetCol.onChange =
    inSetBg.onChange =
    inEle.onLinkChanged =
    r.onChange = g.onChange = b.onChange = a.onChange =
    bgr.onChange = bgg.onChange = bgb.onChange = bga.onChange = update;

op.onDelete = remove;

function remove()
{
    if (ele && ele.style)
    {
        ele.style.removeProperty("color");
        ele.style.removeProperty("background-color");
    }
}

let to = null;
let oldBg = null;
let oldCol = null;

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        let rgbaText = "inherit";

        if (inSetCol.get())
        {
            rgbaText = "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + a.get() + ")";
            oldCol = rgbaText;
            ele.style.color = rgbaText;
        }
        else if (oldCol)
        {
            delete ele.style.color;
            oldCol = null;
        }

        let rgbaBg = "inherit";
        if (inSetBg.get())
        {
            rgbaBg = "rgba(" + Math.floor(bgr.get() * 255) + "," + Math.floor(bgg.get() * 255) + "," + Math.floor(bgb.get() * 255) + ", " + bga.get() + ")";
            oldBg = rgbaBg;
            ele.style["background-color"] = rgbaBg;
        }
        else if (oldBg)
        {
            delete ele.style["background-color"];
            oldBg = null;
        }
    }
    else
    {
        clearTimeout(to);
        to = setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}

}
};






// **************************************************************
// 
// Ops.Html.ModalOverlay
// 
// **************************************************************

Ops.Html.ModalOverlay= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inEle = op.inObject("Content Element"),
    inShow = op.inTriggerButton("Show"),
    inClose = op.inTriggerButton("Close"),
    closeButton = op.inBool("Show Closebutton", true),
    inOpacity = op.inFloatSlider("Opacity", 0.5),
    outVisible = op.outBool("Visible"),
    outClosed = op.outTrigger("Closed"),
    outElement = op.outObject("Element");

const eleContainer = document.createElement("div");
const eleClose = document.createElement("div");

eleClose.innerHTML = "&times;";
eleClose.style.color = "white";
eleClose.style.position = "fixed";
eleClose.style.top =
eleClose.style.right = "25px";
eleClose.style["line-height"] = "25px";
eleClose.style["z-index"] = "9999";
eleClose.style.cursor = "pointer";
eleClose.style["font-size"] = "50px";
eleClose.addEventListener("pointerdown", hide);
eleContainer.addEventListener("pointerdown", hide);
eleContainer.appendChild(eleClose);

inOpacity.onChange = updateBgColor;
eleContainer.style.display = "none";
inShow.onTriggered = show;
inClose.onTriggered = hide;

closeButton.onChange = updateCloseButton;

function updateCloseButton()
{
    if (!eleClose) return;
    if (closeButton.get()) eleClose.style.display = "block";
    else eleClose.style.display = "none";
}

inEle.onChange = function ()
{
    let ele = inEle.get();
    if (ele && eleContainer) eleContainer.appendChild(ele);
};

function hide()
{
    outVisible.set(false);
    eleContainer.style.display = "none";
    outClosed.trigger();
}

function updateBgColor()
{
    eleContainer.style["background-color"] = "rgba(0,0,0," + inOpacity.get() + ")";
}

function show()
{
    outVisible.set(true);
    updateCloseButton();
    eleContainer.style.display = "block";

    eleContainer.dataset.op = op.id;
    let parent = op.patch.cgl.canvas.parentElement;

    eleContainer.style = "overflow:auto;top:0;width:100%;height:100%;position:absolute;z-index:9999";
    updateBgColor();

    parent.appendChild(eleContainer);
    outElement.set(eleContainer);
}

}
};






// **************************************************************
// 
// Ops.Html.ElementFadeInOut
// 
// **************************************************************

Ops.Html.ElementFadeInOut= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"fadeInOut_css":"\n.CABLES_animFadedOut_$CLASSES_ID\n{\n    display:none !important;\n    opacity:0;\n}\n\n.CABLES_animFadeOut_$CLASSES_ID\n{\n    animation: CABLES_keysFadeOut_$CLASSES_ID $LENGTHs normal forwards ease-in-out;\n}\n\n.CABLES_animFadeIn_$CLASSES_ID\n{\n    animation: CABLES_keysFadeIn_$CLASSES_ID $LENGTHs normal forwards ease-in-out;\n}\n\n@keyframes CABLES_keysFadeIn_$CLASSES_ID {\n    from { opacity: 0; }\n    to   { opacity: $FULLOPACITY; }\n}\n\n@keyframes CABLES_keysFadeOut_$CLASSES_ID {\n    from { opacity: $FULLOPACITY; }\n    to   { opacity: 0; }\n}\n",};
const
    inEle = op.inObject("HTML Element"),
    inVisible = op.inValueBool("Visible", true),
    inDuration = op.inValue("Duration", 0.25),
    inOpacity = op.inValue("Opacity", 1),
    outEle = op.outObject("PassThrough", null, "element"),
    outShowing = op.outBoolNum("Is Showing", false);

let theTimeout = null;
let oldEle = null;
let loaded = true;
const oldvis = null;
loaded = true;

inDuration.onChange =
    inOpacity.onChange = update;

inVisible.onChange =
    inEle.onChange = updateVisibility;

let styleEle = null;
const eleId = "css_" + CABLES.uuid();
const cssClassesId = CABLES.shortId();

const animFadeInClass = "CABLES_animFadeIn_" + cssClassesId;
const animFadedOutClass = "CABLES_animFadedOut_" + cssClassesId;
const animFadeOutClass = "CABLES_animFadeOut_" + cssClassesId;

update();

op.onLoaded = function ()
{
    loaded = true;
    updateVisibility();
    outShowing.set(inVisible.get());
};

inEle.onChange =
outEle.onLinkChanged =
inEle.onLinkChanged = () =>
{
    outEle.setRef(inEle.get());
    updateVisibility();
};

function updateVisibility()
{
    const ele = inEle.get();

    if (!loaded)
    {
        setTimeout(updateVisibility, 50);
        return;
    }

    if (styleEle && ele)
    {
        // if (ele == oldEle) return;
        // oldEle = ele;
        if (inVisible.get())
        {
            outShowing.set(true);
            if (ele && ele.classList && !ele.classList.contains(animFadeInClass))
            {
                clearTimeout(theTimeout);
                ele.classList.remove(animFadedOutClass);
                ele.classList.remove(animFadeOutClass);
                ele.classList.add(animFadeInClass);
                theTimeout = setTimeout(function ()
                {
                    ele.classList.remove(animFadeInClass);
                    outShowing.set(true);
                }, inDuration.get() * 1000);
            }
        }
        else
        {
            outShowing.set(true);
            if (ele && ele.classList && !ele.classList.contains(animFadedOutClass))
            {
                clearTimeout(theTimeout);
                ele.classList.remove(animFadeInClass);
                ele.classList.add(animFadeOutClass);
                theTimeout = setTimeout(function ()
                {
                    ele.classList.add(animFadedOutClass);
                    outShowing.set(false);
                }, inDuration.get() * 1000);
            }
        }
    }
    else
    {
        // op.logError("no html element");
    }
}

function getCssContent()
{
    let css = attachments.fadeInOut_css;

    while (css.indexOf("$LENGTH") > -1)css = css.replace("$LENGTH", inDuration.get());
    while (css.indexOf("$FULLOPACITY") > -1)css = css.replace("$FULLOPACITY", inOpacity.get());
    while (css.indexOf("$CLASSES_ID") > -1)css = css.replace("$CLASSES_ID", cssClassesId);

    return css;
}

function update()
{
    styleEle = document.getElementById(eleId);

    if (styleEle)
    {
        styleEle.textContent = getCssContent();
    }
    else
    {
        styleEle = document.createElement("style");
        styleEle.type = "text/css";
        styleEle.id = eleId;
        styleEle.classList.add("cablesEle");
        styleEle.textContent = getCssContent();

        const head = document.getElementsByTagName("body")[0];
        head.appendChild(styleEle);
    }
}

op.onDelete = function ()
{
    const ele = inEle.get();

    if (ele && ele.classList)
    {
        ele.classList.remove(animFadeInClass);
        ele.classList.remove(animFadedOutClass);
        ele.classList.remove(animFadeOutClass);
    }

    styleEle = document.getElementById(eleId);
    if (styleEle)styleEle.remove();
};

}
};






// **************************************************************
// 
// Ops.Html.MarkdownToHtml
// 
// **************************************************************

Ops.Html.MarkdownToHtml= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inStr = op.inStringEditor("Markdown", "## hello\n\nthis is some text...", "markdown"),
    inActive = op.inBool("Active", true),
    outStr = op.outString("Html");

inActive.onChange =
inStr.onChange = update;
update();

function update()
{
    let str = inStr.get() + "";
    if (inActive.get())
        str = marked.parse(str);
    outStr.set(str);
}

}
};






// **************************************************************
// 
// Ops.Html.CSS.ElementCssText
// 
// **************************************************************

Ops.Html.CSS.ElementCssText= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inEle = op.inObject("Element", null, "element"),
    inSetFam = op.inBool("Set Family", true),
    inFamily = op.inString("Font Family", "sans serif"),
    inSize = op.inFloat("Text Size", 12),
    inWeight = op.inString("Font Weight", "normal"),
    inAlign = op.inSwitch("Text Align", ["Left", "Center", "Right", "Justify"], "Left"),
    inDecoration = op.inSwitch("Text Decoration", ["None", "Underline", "Overline", "Line-Through"], "None"),
    inOverflow = op.inBool("Overflow Ellipsis", false),
    inLetterSpace = op.inFloat("Letter Spacing", 0),
    inLineHeight = op.inFloat("Line Height", 0),
    inUserSelectNone = op.inBool("Disable Text Select", false),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;

inLetterSpace.onChange =
    inOverflow.onChange =
    inEle.onChange =
    inEle.onLinkChanged =
    inFamily.onChange =
    inSize.onChange =
    inWeight.onChange =
    inAlign.onChange =
    inDecoration.onChange =
    inLineHeight.onChange =
    inSetFam.onChange =
        update;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("font-family");
    ele.style.removeProperty("user-select");
    ele.style.removeProperty("letter-spacing");
    ele.style.removeProperty("text-align");
    ele.style.removeProperty("line-height");
    ele.style.removeProperty("font-size");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        if (inSetFam.get()) ele.style["font-family"] = inFamily.get();
        ele.style["letter-spacing"] = inLetterSpace.get() + "px";

        ele.style["font-weight"] = inWeight.get();
        ele.style["text-align"] = inAlign.get().toLowerCase();
        ele.style["text-decoration"] = inDecoration.get().toLowerCase();

        if (inSize.get())ele.style["font-size"] = inSize.get() + "px";
        else ele.style["font-size"] = "";

        if (inLineHeight.get()) ele.style["line-height"] = inLineHeight.get() + "px";
        else ele.style["line-height"] = "";

        if (inUserSelectNone.get())ele.style["user-select"] = "none";
    }
    else
    {
        setTimeout(update, 50);
    }

    if (outEle != inEle.get())
        outEle.setRef(inEle.get());
}

}
};






// **************************************************************
// 
// Ops.Html.Elements.Element_v2
// 
// **************************************************************

Ops.Html.Elements.Element_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inText = op.inString("Text", "Element"),
    inPos = op.inSwitch("Position", ["Absolute", "Static", "Relative", "Fixed"], "Absolute"),
    inInteractive = op.inSwitch("Interactive", ["True", "False", "No Pointer Events"], "True"),

    inSetSize = op.inBool("Set Size", false),
    inWidth = op.inFloat("Width", 100),
    inHeight = op.inFloat("Height", 100),
    inSizeUnit = op.inSwitch("Size  Units", ["px", "%", "vwh"], "px"),

    inOverflow = op.inSwitch("Overflow", ["Visible", "Hidden", "Scroll", "Auto"], "Hidden"),

    inStyle = op.inStringEditor("Inline Style", "", "inline-css"),
    inClass = op.inString("CSS Class"),
    inBlacklist = op.inString("Disable CSS Props"),

    inDisplay = op.inDropDown("Display", ["None", "Block", "Inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "flow-root"], "Block"),
    inTag = op.inString("Tag Name", "div"),
    inOpacity = op.inFloatSlider("Opacity", 1),
    inPropagation = op.inBool("Propagate Click-Events", true),
    inAddDom = op.inBool("Add to DOM", true),

    outElement = op.outObject("DOM Element", null, "element"),
    outHover = op.outBoolNum("Hovering"),
    outClicked = op.outTrigger("Clicked");

op.setPortGroup("Area", [inWidth, inHeight, inSetSize, inSizeUnit, inOverflow]);
op.setPortGroup("CSS", [inClass, inStyle, inBlacklist]);

let listenerElement = null;
let oldStr = null;
let prevDisplay = "block";
let div = null;

const parent = op.patch.containerElement;

createElement();

inClass.onChange = updateClass;
inText.onChange = updateText;

inTag.onChange = () =>
{
    removeElement();
    createElement();
    updateClass();
    updateText(); updateInteractive();
};

inSetSize.onChange =
    updateUiAndStyle;

inDisplay.onChange =
    inOpacity.onChange =
    inPos.onChange =
    inWidth.onChange =
    inHeight.onChange =
    inOverflow.onChange =
    inSizeUnit.onChange =
    inHeight.onChange =
    inStyle.onChange = updateStyle;

inInteractive.onChange = updateInteractive;

updateText();
updateUiAndStyle();
warning();
updateInteractive();

let oldClassesStr = "";
op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

inInteractive.onLinkChanged =
outClicked.onLinkChanged = () =>
{
    op.setUiError("interactiveProblem", null);
    if (outClicked.isLinked() && !isInteractive())
        op.setUiError("interactiveProblem", "Interactive should be activated when linking clicked port", 0);
};

inAddDom.onChange = () =>
{
    if (!inAddDom.get())removeElement();
    else
    {
        createElement();
        updateAll();
    }
};

function updateAll()
{
    updateStyle();
    updateClass();
    updateText();
    updateInteractive();
}

function updateUiAndStyle()
{
    inWidth.setUiAttribs({ "greyout": !inSetSize.get() });
    inSizeUnit.setUiAttribs({ "greyout": !inSetSize.get() });
    inHeight.setUiAttribs({ "greyout": !inSetSize.get() });
    updateStyle();
}

function createElement()
{
    div = op.patch.getDocument().createElement(inTag.get() || "div");
    div.dataset.op = op.id;
    div.classList.add("cablesEle");
    if (inTag.get() != "div")op.setUiAttribs({ "extendTitle": inTag.get() });

    parent.appendChild(div);
    outElement.setRef(div);
    updateStyle();
}

function removeElement()
{
    if (div) removeClasses();
    if (div && div.parentNode) div.parentNode.removeChild(div);
    oldStr = null;
    div = null;
}

function updateText()
{
    let str = inText.get();

    if (oldStr === str) return;
    oldStr = str;

    if (div && div.innerHTML != str) div.innerHTML = str;
    outElement.setRef(div);
}

function updateStyle()
{
    if (!div) return;

    div.setAttribute("style", inStyle.get());

    div.style.position = inPos.get().toLowerCase();

    div.style.overflow = inOverflow.get().toLowerCase();
    div.style.display = inDisplay.get();
    div.style.opacity = inOpacity.get();
    if (inInteractive.get() == "No Pointer Events")div.style.pointerEvents = "none";

    if (inSetSize.get())
    {
        div.style.width = inWidth.get() + inSizeUnit.get();
        div.style.height = inHeight.get() + inSizeUnit.get();
    }
    else
    {
        div.style.width = "";
        div.style.height = "";
    }

    outElement.setRef(div);

    if (!div.parentElement) parent.appendChild(div);

    warning();
}

function removeClasses()
{
    if (!div) return;

    const classes = (inClass.get() || "").split(" ");
    for (let i = 0; i < classes.length; i++)
    {
        try
        {
            if (classes[i]) div.classList.remove(classes[i]);
        }
        catch (e) { console.log("e", e); }
    }
    oldClassesStr = "";
}

function updateClass()
{
    const classes = (inClass.get() || "").split(" ");
    const oldClasses = (oldClassesStr || "").split(" ");

    let found = false;

    for (let i = 0; i < oldClasses.length; i++)
    {
        if (
            oldClasses[i] &&
            classes.indexOf(oldClasses[i].trim()) == -1)
        {
            found = true;
            div.classList.remove(oldClasses[i]);
        }
    }

    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i])
        {
            div.classList.add(classes[i].trim());
        }
    }

    oldClassesStr = inClass.get();
    warning();
    outElement.setRef(div);
}

function onMouseEnter(e)
{
    outHover.set(true);
}

function onMouseLeave(e)
{
    outHover.set(false);
}

function onKey(e)
{
    if (e.keyCode == 13 || e.keyCode == 32) outClicked.trigger();
}

function onMouseClick(e)
{
    if (!inPropagation.get()) e.stopPropagation();
    outClicked.trigger();
}

function isInteractive()
{
    return inInteractive.get() == "True";// != "No Pointer Events";
}

function updateInteractive()
{
    op.setUiError("interactiveProblem", null);

    removeListeners();
    if (isInteractive()) addListeners();
    updateStyle();
}

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("pointerdown", onMouseClick);
        listenerElement.removeEventListener("pointerleave", onMouseLeave);
        listenerElement.removeEventListener("pointerenter", onMouseEnter);
        listenerElement.removeEventListener("keydown", onKey, false);
        listenerElement.removeAttribute("tabindex");
        listenerElement = null;
    }
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = div;

    if (listenerElement)
    {
        listenerElement.addEventListener("pointerdown", onMouseClick);
        listenerElement.addEventListener("pointerleave", onMouseLeave);
        listenerElement.addEventListener("pointerenter", onMouseEnter);
        listenerElement.setAttribute("tabindex", 0);
        listenerElement.addEventListener("keydown", onKey, false);
    }
}

op.addEventListener("onEnabledChange", (enabled) =>
{
    removeElement();
    if (!enabled) return;
    createElement();

    updateAll();
});

function warning()
{
    if (inClass.get() && inStyle.get())
    {
        op.setUiError("error", "Element uses external and inline CSS", 1);
    }
    else
    {
        op.setUiError("error", null);
    }
}

//

}
};






// **************************************************************
// 
// Ops.Html.CSS.ElementCssPadding_v2
// 
// **************************************************************

Ops.Html.CSS.ElementCssPadding_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inEle = op.inObject("Element", null, "element"),
    inPadding = op.inFloat("Padding", 10),
    inPadTop = op.inFloat("Padding Top", 0),
    inPadBottom = op.inFloat("Padding Bottom", 0),
    inPadLeft = op.inFloat("Padding Left", 0),
    inPadRight = op.inFloat("Padding Right", 0),
    outEle = op.outObject("HTML Element", null, "element");

let ele = null;
inPadding.onChange =
inEle.onChange =
    inEle.onLinkChanged =
    inPadTop.onChange =
    inPadBottom.onChange =
    inPadRight.onChange =
    inPadLeft.onChange =
        update;

let to = null;

op.onDelete = remove;

function remove()
{
    if (!ele) return;
    ele.style.removeProperty("padding-top");
    ele.style.removeProperty("padding-bottom");
    ele.style.removeProperty("padding-left");
    ele.style.removeProperty("padding-right");
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        ele.style["padding-top"] = inPadding.get() + inPadTop.get() + "px";
        ele.style["padding-bottom"] = inPadding.get() + inPadBottom.get() + "px";
        ele.style["padding-left"] = inPadding.get() + inPadLeft.get() + "px";
        ele.style["padding-right"] = inPadding.get() + inPadRight.get() + "px";
    }
    else
    {
        clearTimeout(to);
        to = setTimeout(update, 50);
    }

    outEle.setRef(ele);
}

}
};






// **************************************************************
// 
// Ops.Devices.TouchGesture
// 
// **************************************************************

Ops.Devices.TouchGesture= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
// inputs
const inEnabled = op.inBool("Active", true);
let enableVerticalSwipePort = op.inValueBool("Vertical Swipe", true);
let enableVerticalPanPort = op.inValueBool("Vertical Pan", true);

// outputs
let pressPort = op.outTrigger("Press");
let pressUpPort = op.outTrigger("Press Up");
let panLeftPort = op.outTrigger("Pan Left");
let panRightPort = op.outTrigger("Pan Right");
let swipeLeftPort = op.outTrigger("Swipe Left");
let swipeRightPort = op.outTrigger("Swipe Right");
let swipeUpPort = op.outTrigger("Swipe Up");
let swipeDownPort = op.outTrigger("Swipe Down");
let eventPort = op.outObject("Event");

let canvas = op.patch.cgl.canvas;

// create a simple instance
// by default, it only adds horizontal recognizers
let mc = new Hammer(canvas);

// change listeners
enableVerticalSwipePort.onChange = onEnableVerticalSwipePortChange;
enableVerticalPanPort.onChange = onEnableVerticalPanPortChange;

// init
onEnableVerticalSwipePortChange();
onEnableVerticalPanPortChange();

function onEnableVerticalSwipePortChange()
{
    let direction = Hammer.DIRECTION_HORIZONTAL;
    if (enableVerticalSwipePort.get())
    {
        direction = Hammer.DIRECTION_ALL;
    }
    mc.get("swipe").set({ "direction": direction });
}

function onEnableVerticalPanPortChange()
{
    let direction = Hammer.DIRECTION_HORIZONTAL;
    if (enableVerticalPanPort.get())
    {
        direction = Hammer.DIRECTION_ALL;
    }
    mc.get("pan").set({ "direction": direction });
}

/*
mc.on("panleft panright tap press", function(ev) {
    myElement.textContent = ev.type +" gesture detected.";
});
*/

mc.on("panleft", onPanLeft);
mc.on("panright", onPanRight);
mc.on("swipeleft", onSwipeLeft);
mc.on("swiperight", onSwipeRight);
mc.on("swipeup", onSwipeUp);
mc.on("swipedown", onSwipeDown);
mc.on("press", onPress);
mc.on("pressup", onPressUp);

function onPress(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    pressPort.trigger();
}

function onPressUp(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    pressUpPort.trigger();
}

function onPanLeft(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    panLeftPort.trigger();
}

function onPanRight(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    panRightPort.trigger();
}

function onSwipeLeft(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeLeftPort.trigger();
}

function onSwipeRight(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeRightPort.trigger();
}

function onSwipeUp(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeUpPort.trigger();
}

function onSwipeDown(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeDownPort.trigger();
}

/*
// By default it adds a set of tap, doubletap, press,
// horizontal pan and swipe, and the multi-touch pinch
// and rotate recognizers. The pinch and rotate recognizers
// are disabled by default because they would make the
// element blocking, but you can enable them by calling:
hammertime.get('pinch').set({ enable: true });
hammertime.get('rotate').set({ enable: true });

// Enabling vertical or all directions for the pan and swipe recognizers:
hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
*/

}
};






// **************************************************************
// 
// Ops.Html.FontFile_v2
// 
// **************************************************************

Ops.Html.FontFile_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    filename = op.inUrl("file", [".otf", ".ttf", ".woff", ".woff2"]),
    fontname = op.inString("family"),
    inActive = op.inBool("Active", true),
    outLoaded = op.outBoolNum("Loaded"),
    loadedTrigger = op.outTrigger("Loaded Trigger");

let loadingId = null;
let fontFaceObj;
let doc = null;
let to = null;
let style = null;
let oldFontName = "";

op.toWorkPortsNeedsString(fontname);

filename.onChange = function ()
{
    outLoaded.set(false);
    addStyle(null);

    updateUi();
};

inActive.onChange =
fontname.onChange = () =>
{
    loadSoon();
    updateUi();
};

function updateUi()
{
    if (!inActive.get()) op.setUiAttrib({ "extendTitle": "x" });
    else op.setUiAttrib({ "extendTitle": CABLES.filename(filename.get()) });
}

function loadSoon()
{
    clearTimeout(to);
    to = setTimeout(() =>
    {
        addStyle(null);
    }, 50);
}

op.patch.on("windowChanged",
    (win) =>
    {
        fontFaceObj = null;
        addStyle(win.document);
    });

function addStyle(_doc)
{
    if (style)style.remove();

    if (fontFaceObj)
    {
        const success = doc.fonts.delete(fontFaceObj);
        fontFaceObj = null;

        setTimeout(() => // delete needs some time, so we delay this a bit.....
        {
            op.patch.emitEvent("fontLoaded", oldFontName);
        }, 100);
    }

    if (!inActive.get()) return;
    doc = _doc || doc || op.patch.cgl.canvas.ownerDocument || document;

    if (loadingId)loadingId = op.patch.cgl.patch.loading.finished(loadingId);

    op.setUiError("loadingerror", null);

    oldFontName = fontname.get();

    if (filename.get() && fontname.get())
    {
        if (doc.fonts)
        {
            let url = "url(\"" + op.patch.getFilePath(String(filename.get())) + "\")";
            fontFaceObj = new FontFace(fontname.get(), url);

            loadingId = op.patch.cgl.patch.loading.start("FontFile", filename.get(), op);
            // Add the FontFace to the FontFaceSet
            doc.fonts.add(fontFaceObj);

            // Get the current status of the FontFace
            // (should be 'unloaded')

            // Load the FontFace

            // Get the current status of the Fontface
            // (should be 'loading' or 'loaded' if cached)

            // Wait until the font has been loaded, log the current status.
            fontFaceObj.loaded.then((fontFace) =>
            {
                outLoaded.set(true);
                loadedTrigger.trigger();
                loadingId = op.patch.cgl.patch.loading.finished(loadingId);

                op.patch.emitEvent("fontLoaded", fontname.get());

                // Throw an error if loading wasn't successful
            }, (fontFace) =>
            {
                op.setUiError("loadingerror", "Font loading error: " + fontFaceObj.status + "(" + filename.get() + ")");
                loadingId = op.patch.cgl.patch.loading.finished(loadingId);
                outLoaded.set(true);

                // op.logError("Font loading error! Current status", fontFaceObj.status);
            }).catch((f) =>
            {
                loadingId = op.patch.cgl.patch.loading.finished(loadingId);
                console.error("catch ", f);
            });

            fontFaceObj.load();
        }
        else
        { // font loading api not supported
            const fileUrl = op.patch.getFilePath(String(filename.get()));
            const styleStr = ""
                .endl() + "@font-face"
                .endl() + "{"
                .endl() + "  font-family: \"" + fontname.get() + "\";"
                .endl() + "  src: url(\"" + fileUrl + "\") format(\"truetype\");"
                .endl() + "}";

            style = document.createElement("style");
            style.classList.add("cablesEle");
            style.type = "text/css";
            style.innerHTML = styleStr;
            document.getElementsByTagName("head")[document.getElementsByTagName("head").length - 1].appendChild(style);
            // TODO: Poll if font loaded
        }
    }
}

}
};






// **************************************************************
// 
// Ops.Gl.SaveScreenShot_v3
// 
// **************************************************************

Ops.Gl.SaveScreenShot_v3= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    filename = op.inString("Filename", "cables"),
    exe = op.inTriggerButton("Screenshot"),
    outNext = op.outTrigger("Finished");


const cgl = op.patch.cgl;

exe.onTriggered = function ()
{
    cgl.saveScreenshot(
        filename.get(),
        function ()
        {
            outNext.trigger();

            op.patch.resume();
        }
    );
};


}
};






// **************************************************************
// 
// Ops.Html.Utils.Notification
// 
// **************************************************************

Ops.Html.Utils.Notification= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={"defaultstyle_txt":"visibility: hidden;\nbackground-color: #282828;\ncolor: #fff;\n\npadding: 16px;\nposition: absolute;\nz-index: 9999;\nfont-size: 17px;\nopacity:0;\nborder-radius:10px;\ntext-align:center;\nleft: 50%;\ntransform: translate(-50%, 0);\n",};
const
    triggerAnim = op.inTriggerButton("Trigger animation"),
    inText = op.inString("Text", "Hello! <br> This is a pop up"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", attachments.defaultstyle_txt, "none"),
    inVisible = op.inValueBool("Active", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    fadeInDuration = op.inFloat("Fade in", 0.5),
    holdDuration = op.inFloat("Hold ", 2.0),
    fadeOutDuration = op.inFloat("Fade out", 0.8),
    percentOrPixel = op.inSwitch("mode", ["%", "px"], "%"),
    divSide = op.inSwitch("Side", ["bottom", "top"], "bottom"),
    startPosition = op.inFloat("Starting position", 0),
    endPosition = op.inFloat("Ending position", 5),
    finishedTrigger = op.outTrigger("Finished trigger"),
    finished = op.outBool("Finished", false),
    outElement = op.outObject("DOM Element");

op.setPortGroup("Animation", [fadeInDuration, holdDuration, fadeOutDuration]);
op.setPortGroup("HTML CSS", [inText, inClass, inStyle, inVisible, inBreaks]);
op.setPortGroup("Positioning", [percentOrPixel, divSide, startPosition, endPosition]);

const divid = "notification_" + CABLES.uuid();

// inStyle.setUiAttribs({editorSyntax:'css'});
const listenerElement = null;
let oldStr = null;

let prevDisplay = "block";

const div = document.createElement("div");
div.dataset.op = op.id;
div.id = divid;

const canvas = op.patch.cgl.canvas.parentElement;

canvas.appendChild(div);
outElement.set(div);

inClass.onChange = updateClass;
inBreaks.onChange = inText.onChange = updateText;
inStyle.onChange = updateStyle;
inVisible.onChange = updateVisibility;

triggerAnim.onTriggered = popUpAnim;

updateText();
updateStyle();
warning();

op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

let animInProgress = false;

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = "none";
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateText()
{
    let str = inText.get();

    if (oldStr === str) return;
    oldStr = str;

    if (str && inBreaks.get()) str = str.replace(/(?:\r\n|\r|\n)/g, "<br>");

    if (div.innerHTML != str) div.innerHTML = str;
    outElement.set(null);
    outElement.set(div);
}

function removeElement()
{
    if (div && div.parentNode) div.parentNode.removeChild(div);
}

// inline css inisde div
function updateStyle()
{
    if (inStyle.get() != div.style)
    {
        div.setAttribute("style", inStyle.get());

        updateVisibility();
        outElement.set(null);
        outElement.set(div);
    }
    warning();
}

function updateClass()
{
    div.setAttribute("class", inClass.get());
    warning();
}

op.addEventListener("onEnabledChange", function (enabled)
{
    op.log("css changed");
    setCSSVisible(div.style.visibility != "visible");
});

function warning()
{
    if (inClass.get() && inStyle.get()) op.setUiError("error", "DIV uses external and inline CSS", 1);
    else op.setUiError("error", null);
}

function popUpAnim()
{
    if (!inVisible.get()) return;

    const mode = percentOrPixel.get();
    const start = startPosition.get() + mode;
    const end = endPosition.get() + mode;

    const targetDiv = document.getElementById(divid);
    div.style.display = "block";

    const animData = {};
    // this function cascades into each stage when started
    startAnim(mode, start, end, animData);
}

function startAnim(mode, start, end, animData)
{
    // stop the glitches from it being triggered multiple times
    if (animInProgress) return;

    finished.set(false);
    animInProgress = true;

    animData.easing = ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear"];
    animData.opacity = [0, 1];

    if (divSide.get() == "bottom") animData.bottom = [start, end];
    else animData.top = [start, end];

    document.getElementById(divid).animate(
        animData, fadeInDuration.get() * 1000).onfinish = function ()
    {
        holdAnim(mode, start, end, animData);
    };
}

function holdAnim(mode, start, end, animData)
{
    animData.easing = ["linear", "linear"];
    animData.opacity = [1, 1];

    if (divSide.get() == "bottom") animData.bottom = [end, end];
    else animData.top = [end, end];

    document.getElementById(divid).animate(animData, holdDuration.get() * 1000).onfinish =
        function ()
        {
            endAnim(mode, start, end, animData);
        };
}

function endAnim(mode, start, end, animData)
{
    animData.easing = ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear"];
    animData.opacity = [1, 0];

    if (divSide.get() == "bottom") animData.bottom = [end, start];
    else animData.top = [end, start];

    document.getElementById(divid).animate(
        animData, fadeOutDuration.get() * 1000).onfinish = function ()
    {
        div.style.display = "none";
        animInProgress = false;
        finishedTrigger.trigger();
        finished.set(true);
    };
}

}
};






// **************************************************************
// 
// Ops.Boolean.BoolToString
// 
// **************************************************************

Ops.Boolean.BoolToString= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inBool = op.inBool("Boolean", false),
    inFalse = op.inString("False", "false"),
    inTrue = op.inString("True", "true"),
    result = op.outString("String", "false");

inTrue.onChange =
    inFalse.onChange =
    inBool.onChange = update;

function update()
{
    if (inBool.get()) result.set(inTrue.get());
    else result.set(inFalse.get());
}

}
};






// **************************************************************
// 
// Ops.Extension.Deprecated.SmootherStep
// 
// **************************************************************

Ops.Extension.Deprecated.SmootherStep= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    val = op.inValueFloat("val", 0),
    min = op.inValueFloat("min", 0),
    max = op.inValueFloat("max", 1),
    result = op.outNumber("result");

val.onChange = max.onChange = min.onChange = exec;
exec();

function exec()
{
    let x = Math.max(0, Math.min(1, (val.get() - min.get()) / (max.get() - min.get())));
    result.set(x * x * x * (x * (x * 6 - 15) + 10) * (max.get() - min.get())); // smootherstep
}

}
};






// **************************************************************
// 
// Ops.Html.CSS.CSSProperty_v2
// 
// **************************************************************

Ops.Html.CSS.CSSProperty_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inValue = op.inFloat("Value"),
    inValueSuffix = op.inString("Value Suffix", "px"),
    outEle = op.outObject("HTML Element", null, "element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue, inValueSuffix]);

inProperty.onChange = updateProperty;
inValue.onChange = update;
inValueSuffix.onChange = update;
let ele = null;

inEle.onChange = inEle.onLinkChanged = function ()
{
    if (ele && ele.style)
    {
        ele.style[inProperty.get()] = "initial";
    }
    update();
};

function updateProperty()
{
    update();
    op.setUiAttrib({ "extendTitle": inProperty.get() + "" });
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        const str = inValue.get() + inValueSuffix.get();
        try
        {
            if (ele.style[inProperty.get()] != str)
                ele.style[inProperty.get()] = str;
        }
        catch (e)
        {
            op.logError(e);
        }
    }
    else
    {
        setTimeout(update, 50);
    }

    outEle.setRef(inEle.get());
}

}
};






// **************************************************************
// 
// Ops.Html.CSS.ElementCssBorder
// 
// **************************************************************

Ops.Html.CSS.ElementCssBorder= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    inEle = op.inObject("Element"),
    inThick = op.inFloat("Thickness", 3),
    inRadius = op.inFloat("Radius", 0),

    r = op.inValueSlider("Color R", 1),
    g = op.inValueSlider("Color G", 1),
    b = op.inValueSlider("Color B", 1),
    a = op.inValueSlider("Color A", 1),
    borderTop = op.inBool("Top", true),
    borderBottom = op.inBool("Bottom", true),
    borderLeft = op.inBool("Left", true),
    borderRight = op.inBool("Right", true),

    outEle = op.outObject("HTML Element", null, "element");

r.setUiAttribs({ "colorPick": true });

let ele = null;

borderTop.onChange =
borderBottom.onChange =
borderLeft.onChange =
borderRight.onChange =
inEle.onChange =
inEle.onLinkChanged =
inThick.onChange =
inRadius.onChange =
    r.onChange = g.onChange = b.onChange = a.onChange =
         update;

op.onDelete = remove;

function remove()
{
    if (ele)
    {
        ele.style.removeProperty("border");
        ele.style.removeProperty("borderTop");
        ele.style.removeProperty("borderBottom");
        ele.style.removeProperty("borderLeft");
        ele.style.removeProperty("borderRight");
        ele.style.removeProperty("border-radius");
    }
}

function update()
{
    remove();
    ele = inEle.get();

    if (ele && ele.style)
    {
        let rgbaText = "rgba(" + Math.floor(r.get() * 255) + "," + Math.floor(g.get() * 255) + "," + Math.floor(b.get() * 255) + "," + a.get() + ")";

        if (borderTop.get() && borderBottom.get() && borderRight.get() && borderLeft.get())
        {
            ele.style.border = inThick.get() + "px solid " + rgbaText;
        }
        else
        {
            if (borderTop.get())ele.style.borderTop = inThick.get() + "px solid " + rgbaText;
            if (borderBottom.get())ele.style.borderBottom = inThick.get() + "px solid " + rgbaText;
            if (borderLeft.get())ele.style.borderLeft = inThick.get() + "px solid " + rgbaText;
            if (borderRight.get())ele.style.borderRight = inThick.get() + "px solid " + rgbaText;
        }

        ele.style["border-radius"] = inRadius.get() + "px";
    }
    // else
    // {
    //     setTimeout(update, 50);
    // }

    // if (outEle != inEle.get())
    outEle.setRef(inEle.get());
}

}
};






// **************************************************************
// 
// Ops.Html.ElementChilds_v2
// 
// **************************************************************

Ops.Html.ElementChilds_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    parentPort = op.inObject("Parent", null, "element"),
    outParent = op.outObject("Parent Out", null, "element");

const canvas = op.patch.cgl.canvas.parentElement;

op.toWorkPortsNeedToBeLinked(parentPort);

const inPorts = [];
for (let i = 0; i < 10; i++)
{
    const p = op.inObject("Child " + (i + 1), null, "element");
    inPorts.push(p);
    p.onChange = () =>
    {
        rebuild();
        if (!p.get())
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = canvas.querySelector(selector);
            if (currentChild) delete currentChild.dataset.cablesChildId;
        }
    };
    p.onLinkChanged = () =>
    {
        if (!p.isLinked())
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = canvas.querySelector(selector);
            if (currentChild) currentChild.remove();
        }
    };
}

parentPort.onLinkChanged = () =>
{
    if (!parentPort.isLinked())
    {
        cleanUp();
    }
    else
    {
        rebuild();
    }
};

outParent.onLinkChanged = () =>
{
    if (!outParent.isLinked())
    {
        const parentDiv = parentPort.get();
        if (parentDiv && parentDiv.dataset.op)
        {
            const inDoc = canvas.querySelector("[data-op=' " + parentDiv.dataset.op + " ']");
            if (!inDoc)
            {
                canvas.appendChild(parentDiv);
            }
        }
    }
};

parentPort.onChange = () =>
{
    if (!parentPort.get())
    {
        cleanUp();
    }
    rebuild();
};

function cleanUp()
{
    for (let i = 0; i < inPorts.length; i++)
    {
        const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
        const currentChild = canvas.querySelector(selector);
        if (currentChild && currentChild.parentNode)
        {
            currentChild.remove();
        }
    }
    outParent.set(null);
}

function rebuild()
{
    const parent = parentPort.get();
    if (!parent)
    {
        outParent.set(null);
        return;
    }

    if (!parent.querySelector)
    {
        outParent.set(null);
        return;
    }

    op.setUiError("id", null);
    try
    {
        op.setUiError("multilinks", null);

        for (let i = 0; i < inPorts.length; i++)
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = parent.querySelector(selector);
            if (currentChild)
            {
                currentChild.remove();
            }
            const p = inPorts[i].get();
            if (inPorts[i].links.length > 1)
            {
                op.setUiError("multilinks", "Every port should only have not more then one connection");
            }
            if (p && parent)
            {
                if (!p.dataset)console.warn("[elementChilds] p no dataset ?!");
                else p.dataset.cablesChildId = op.id + "_" + i;
                parent.appendChild(p);
            }
        }
    }
    catch (e)
    {
        op.setUiError("id", e.message);
    }
    outParent.setRef(parent);
}

}
};






// **************************************************************
// 
// Ops.Html.CSS.CSSFilter
// 
// **************************************************************

Ops.Html.CSS.CSSFilter= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const inEle = op.inObject("Element");
const inMethod = op.inValueSelect("method", ["-", "blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"]);
const inVal = op.inValue("Value");

let suffix = "";
let prefix = "";

inVal.onChange = setValue;
inEle.onChange = setValue;

let oldEle = null;

function getCSSFilterString()
{
    return inMethod.get() + "(" + inVal.get() + suffix + ")";
}

inEle.onLinkChanged = function ()
{
    // remove style when deleting op
    if (inEle.isLinked()) return;

    const ele = oldEle;// inEle.get();

    if (ele && ele.style)
    {
        let filter = ele.style.filter;
        var str = "";

        if (filter && filter.length > 0)
        {
            var str = "";
            let parts = filter.split(" ");
            for (let i = 0; i < parts.length; i++)
            {
                if (parts[i].indexOf(inMethod.get()) == 0)
                    parts[i] = "";
            }

            str = parts.join(" ");
        }
        ele.style.filter = str;
    }
};

function setValue()
{
    const ele = inEle.get();
    let str = "";

    if (ele && ele.style)
    {
        if (ele != oldEle) oldEle = ele;
        let foundMyFilter = false;
        let filter = ele.style.filter;

        if (filter && filter.length > 0)
        {
            let parts = filter.split(" ");
            for (let i = 0; i < parts.length; i++)
            {
                if (parts[i].indexOf(inMethod.get()) == 0)
                {
                    foundMyFilter = true;
                    parts[i] = getCSSFilterString();
                }
            }

            str = parts.join(" ");
        }

        if (!foundMyFilter)
            str += " " + getCSSFilterString();

        ele.style.filter = str;
    }
}

inMethod.onChange = function ()
{
    let m = inMethod.get();

    prefix = inMethod.get() + ":";

    if (m == "blur") suffix = "px";
    if (m == "brightness") suffix = "";
    if (m == "contrast") suffix = "%";
    if (m == "grayscale") suffix = "%";
    if (m == "hue-rotate") suffix = "deg";
    if (m == "invert") suffix = "%";
    if (m == "opacity") suffix = "%";
    if (m == "saturate") suffix = "";
    if (m == "sepia") suffix = "%";
    setValue();
};

}
};






// **************************************************************
// 
// Ops.Anim.SimpleAnim
// 
// **************************************************************

Ops.Anim.SimpleAnim= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTrigger("exe"),
    reset = op.inTriggerButton("reset"),
    rewind = op.inTriggerButton("rewind"),
    inStart = op.inValueFloat("start", 0),
    inEnd = op.inValueFloat("end", 1),
    duration = op.inValueFloat("duration", 0.5),
    loop = op.inValueBool("loop"),
    waitForReset = op.inValueBool("Wait for Reset", true),
    next = op.outTrigger("Next"),
    result = op.outNumber("result"),
    finished = op.outBoolNum("finished"),
    finishedTrigger = op.outTrigger("Finished Trigger");

const anim = new CABLES.Anim();
let resetted = false;
let currentEasing = -1;
anim.createPort(op, "easing", init);
loop.onChange = init;
init();

duration.onChange = init;

function init()
{
    if (anim.keys.length != 3)
    {
        anim.setValue(0, 0);
        anim.setValue(1, 0);
        anim.setValue(2, 0);
    }

    anim.keys[0].time = CABLES.now() / 1000.0;
    anim.keys[0].value = inStart.get();
    if (anim.defaultEasing != currentEasing) anim.keys[0].setEasing(anim.defaultEasing);

    anim.keys[1].time = duration.get() + CABLES.now() / 1000.0;
    anim.keys[1].value = inEnd.get();

    if (anim.defaultEasing != currentEasing) anim.keys[1].setEasing(anim.defaultEasing);

    anim.loop = loop.get();
    if (anim.loop)
    {
        // anim.keys[2].time = (2.0 * duration.get()) + CABLES.now() / 1000.0;
        // anim.keys[2].value = inStart.get();
        // if (anim.defaultEasing != currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    else
    {
        anim.keys[2].time = anim.keys[1].time;
        anim.keys[2].value = anim.keys[1].value;
        if (anim.defaultEasing != currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    finished.set(false);

    currentEasing = anim.defaultEasing;
}

reset.onTriggered = function ()
{
    resetted = true;
    init();
};

rewind.onTriggered = function ()
{
    anim.keys[0].time = CABLES.now() / 1000.0;
    anim.keys[0].value = inStart.get();

    anim.keys[1].time = CABLES.now() / 1000.0;
    anim.keys[1].value = inStart.get();

    anim.keys[2].time = CABLES.now() / 1000.0;
    anim.keys[2].value = inStart.get();

    result.set(inStart.get());
};

exe.onTriggered = function ()
{
    if (waitForReset.get() && !resetted)
    {
        result.set(inStart.get());
        next.trigger();
        return;
    }
    let t = CABLES.now() / 1000;
    let v = anim.getValue(t);
    result.set(v);
    if (anim.hasEnded(t))
    {
        if (!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }

    next.trigger();
};

}
};






// **************************************************************
// 
// Ops.Trigger.DelayedTrigger
// 
// **************************************************************

Ops.Trigger.DelayedTrigger= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTriggerButton("exe"),
    delay = op.inValueFloat("delay", 1),
    cancel = op.inTriggerButton("Cancel"),
    next = op.outTrigger("next"),
    outDelaying = op.outBoolNum("Delaying");

let lastTimeout = null;

cancel.onTriggered = function ()
{
    if (lastTimeout)clearTimeout(lastTimeout);
    lastTimeout = null;
};

exe.onTriggered = function ()
{
    outDelaying.set(true);
    if (lastTimeout)clearTimeout(lastTimeout);

    lastTimeout = setTimeout(
        function ()
        {
            outDelaying.set(false);
            lastTimeout = null;
            next.trigger();
        },
        delay.get() * 1000
    );
};

}
};






// **************************************************************
// 
// Ops.Html.CSS.TransformElement
// 
// **************************************************************

Ops.Html.CSS.TransformElement= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exec = op.inTrigger("Exec"),
    inEle = op.inObject("Element"),
    inScale = op.inFloat("Scale", 1),
    inOrtho = op.inBool("Orthogonal", false),
    inRotate = op.inFloat("Rotate", 0),
    inHideBehind = op.inBool("Hide out of view", false),
    inAlignVert = op.inSwitch("Align Vertical", ["Left", "Center", "Right"], "Left"),
    inAlignHor = op.inSwitch("Align Horizontal", ["Top", "Center", "Bottom"], "Top"),
    inActive = op.inBool("Active", true),
    next = op.outTrigger("Next"),
    outEle = op.outObject("HTML Element", null, "element");

const cgl = op.patch.cgl;
let x = 0;
let y = 0;
let visible = 0;
const m = mat4.create();
const pos = vec3.create();
const trans = vec3.create();

let cachedTop = -1;
let cachedLeft = -1;
let currTransformStr = 0;

exec.onTriggered =
() =>
{
    if (!inActive.get()) return next.trigger();

    setProperties();
    next.trigger();
};

op.onDelete = removeProperties;

let oldEle = null;

inAlignHor.onChange =
    inAlignVert.onChange =
    inRotate.onChange =
    inScale.onChange = updateTransform;

function updateTransform()
{
    const ele = inEle.get();
    if (!ele)
    {
        oldEle = null;
        return;
    }

    let translateStr = "";
    if (inAlignVert.get() == "Left")translateStr = "0%";
    if (inAlignVert.get() == "Center")translateStr = "-50%";
    if (inAlignVert.get() == "Right")translateStr = "-100%";

    translateStr += ", ";
    if (inAlignHor.get() == "Top")translateStr += "0%";
    if (inAlignHor.get() == "Center")translateStr += "-50%";
    if (inAlignHor.get() == "Bottom")translateStr += "-100%";

    const str = "translate(" + translateStr + ") scale(" + inScale.get() + ") rotate(" + inRotate.get() + "deg)";

    // if (currTransformStr != str || oldEle != ele)
    if (ele.style.transform != str)
    {
        currTransformStr = str;
        ele.style.transform = str;
        outEle.setRef(ele);
    }
}

inEle.onChange = function ()
{
    const ele = inEle.get();
    if (!ele)
    {
        removeProperties(oldEle);

        oldEle = null;
        return;
    }

    updateTransform();
    setProperties();
};

inEle.onLinkChanged = function ()
{
    cachedLeft = -1;
    cachedTop = -1;

    if (!inEle.isLinked())
    {
        if (oldEle)
        {
            removeProperties(oldEle);
        }
    }
    else
    {
        oldEle = inEle.get();
    }
    updateTransform();
};

function getScreenCoord()
{
    mat4.multiply(m, cgl.vMatrix, cgl.mMatrix);
    vec3.transformMat4(pos, [0, 0, 0], m);
    vec3.transformMat4(trans, pos, cgl.pMatrix);

    const vp = cgl.getViewPort();

    const w = cgl.canvasWidth / cgl.pixelDensity;
    const h = cgl.canvasHeight / cgl.pixelDensity;

    if (inOrtho.get())
    {
        x = ((w * 0.5 + trans[0] * w * 0.5 / 1));
        y = ((h * 0.5 - trans[1] * h * 0.5 / 1));
    }
    else
    {
        x = (w - (w * 0.5 - trans[0] * w * 0.5)); //  / trans[2]
        y = (h - (h * 0.5 + trans[1] * h * 0.5)); //  / trans[2]
    }

    visible = pos[2] < 0.0 && x > 0 && x < vp[2] && y > 0 && y < vp[3];
}

function setProperties()
{
    const ele = inEle.get();
    oldEle = ele;
    if (ele && ele.style)
    {
        getScreenCoord();
        const yy = cgl.canvas.offsetTop + y;

        const top = cgl.canvas.styleMarginTop || 0;

        if (yy + top != cachedTop)
        {
            ele.style.top = (yy + top) + "px";
            outEle.setRef(ele);
            cachedTop = yy;
        }

        const left = cgl.canvas.styleMarginLeft || 0;

        if (x + left != cachedLeft)
        {
            ele.style.left = (x + left) + "px";
            outEle.setRef(ele);
            cachedLeft = x;
        }

        if (inHideBehind.get())
        {
            if (visible)ele.style.display = "initial";
            else ele.style.display = "none";
        }
    }
}

function removeProperties(ele)
{
    cachedLeft = -1;
    cachedTop = -1;

    if (!ele) ele = inEle.get();
    if (ele && ele.style)
    {
        ele.style.top = "initial";
        ele.style.left = "initial";
        ele.style.transform = "initial";
    }
}

op.addEventListener("onEnabledChange", function (enabled)
{
    if (enabled) setProperties();
    else removeProperties();
});

}
};






// **************************************************************
// 
// Ops.Trigger.TriggerOnce
// 
// **************************************************************

Ops.Trigger.TriggerOnce= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
const
    exe = op.inTriggerButton("Exec"),
    reset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outTriggered = op.outBoolNum("Was Triggered");

let triggered = false;

op.toWorkPortsNeedToBeLinked(exe);

reset.onTriggered = function ()
{
    triggered = false;
    outTriggered.set(triggered);
};

exe.onTriggered = function ()
{
    if (triggered) return;

    triggered = true;
    next.trigger();
    outTriggered.set(triggered);
};

}
};






// **************************************************************
// 
// Ops.Anim.StringTypeAnimation_v2
// 
// **************************************************************

Ops.Anim.StringTypeAnimation_v2= class extends CABLES.Op 
{
static staticAttachments={};

constructor()
{
super(...arguments);
const op=this;
const staticAttachments=this.constructor.staticAttachments;
const attachments=op.attachments={};
let text = op.inStringEditor("text", "hello world");
let inRestart = op.inTriggerButton("Restart");
let speed = op.inValue("Speed", 500);
let speedVariation = op.inValueSlider("Speed Variation");
const showCursor = op.inBool("Show Cursor", true);

let outText = op.outString("Result");
let outChanged = op.outTrigger("Changed");
let outFinished = op.outTrigger("Finished");

outText.set("  \n  ");
let pos = 0;
let updateInterval = 0;
let cursorblink = true;
let finished = false;

function setNewTimeout()
{
    clearTimeout(updateInterval);
    let ms = speed.get() * (Math.random() * (speedVariation.get() * 2 - 1));
    if (text.get() && pos > text.get().length)ms = speed.get();
    updateInterval = setTimeout(update, speed.get() + ms);
}

inRestart.onTriggered = function ()
{
    finished = false;
    pos = 0;
    setNewTimeout();
};

function update()
{
    if (!text.get() || text.get() === "" || text.get() === "0" || text.get() == "0")
    {
        outText.set(" ");
        return;
    }

    let t = text.get().substring(0, pos);
    cursorblink = !cursorblink;

    if (pos > text.get().length && cursorblink)
    {
        if (showCursor.get())
        {
            // t+=' ';
            // pos++;
        }

        if (!finished)
        {
            outFinished.trigger();
            finished = true;
        }
    }
    else
    {
        finished = false;
        if (showCursor.get())
        {
            t += "_";
        }
        pos++;
    }

    outText.set(t);
    outChanged.trigger();
    setNewTimeout();
}

text.onChange = function ()
{
    finished = false;
    pos = 0;
    setNewTimeout();
    outText.set("");
};

}
};





window.addEventListener('load', function(event) {
CABLES.jsLoaded=new Event('CABLES.jsLoaded');
document.dispatchEvent(CABLES.jsLoaded);
});
