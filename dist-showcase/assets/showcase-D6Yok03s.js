(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Lc="170",Cf=0,ol=1,Rf=2,du=1,Pf=2,Hn=3,Yn=0,Ae=1,pn=2,hi=0,fs=1,za=2,al=3,cl=4,pu=5,Ti=100,Lf=101,If=102,Nf=103,Df=104,Uf=200,Oa=201,Ff=202,zf=203,Ba=204,ar=205,Of=206,Bf=207,kf=208,Vf=209,Gf=210,Hf=211,Wf=212,qf=213,Xf=214,ka=0,Va=1,Ga=2,_s=3,Ha=4,Wa=5,qa=6,Xa=7,mu=0,Yf=1,$f=2,ui=0,jf=1,Zf=2,Kf=3,Jf=4,Qf=5,td=6,ed=7,gu=300,xs=301,ys=302,Ya=303,$a=304,Ao=306,ja=1e3,Ri=1001,Za=1002,$e=1003,nd=1004,Mr=1005,wn=1006,ko=1007,Pi=1008,An=1009,vu=1010,_u=1011,cr=1012,Ic=1013,Di=1014,bn=1015,Rs=1016,Nc=1017,Dc=1018,Ms=1020,xu=35902,yu=1021,Mu=1022,en=1023,Su=1024,Eu=1025,ds=1026,Ss=1027,wu=1028,Uc=1029,bu=1030,Fc=1031,zc=1033,uo=33776,fo=33777,po=33778,mo=33779,Ka=35840,Ja=35841,Qa=35842,tc=35843,ec=36196,nc=37492,ic=37496,sc=37808,rc=37809,oc=37810,ac=37811,cc=37812,lc=37813,hc=37814,uc=37815,fc=37816,dc=37817,pc=37818,mc=37819,gc=37820,vc=37821,go=36492,_c=36494,xc=36495,Tu=36283,yc=36284,Mc=36285,Sc=36286,id=3200,sd=3201,rd=0,od=1,oi="",Ue="srgb",Ps="srgb-linear",Co="linear",ne="srgb",Bi=7680,ll=519,ad=512,cd=513,ld=514,Au=515,hd=516,ud=517,fd=518,dd=519,hl=35044,pd=35048,ul="300 es",qn=2e3,Mo=2001;class Ls{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}}const Re=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Vo=Math.PI/180,Ec=180/Math.PI;function Is(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Re[s&255]+Re[s>>8&255]+Re[s>>16&255]+Re[s>>24&255]+"-"+Re[t&255]+Re[t>>8&255]+"-"+Re[t>>16&15|64]+Re[t>>24&255]+"-"+Re[e&63|128]+Re[e>>8&255]+"-"+Re[e>>16&255]+Re[e>>24&255]+Re[n&255]+Re[n>>8&255]+Re[n>>16&255]+Re[n>>24&255]).toLowerCase()}function Le(s,t,e){return Math.max(t,Math.min(e,s))}function md(s,t){return(s%t+t)%t}function Go(s,t,e){return(1-e)*s+e*t}function ks(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Be(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}class ct{constructor(t=0,e=0){ct.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ht{constructor(t,e,n,i,r,o,a,c,l){Ht.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,c,l)}set(t,e,n,i,r,o,a,c,l){const h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],f=n[7],u=n[2],d=n[5],m=n[8],v=i[0],g=i[3],p=i[6],_=i[1],y=i[4],x=i[7],C=i[2],w=i[5],T=i[8];return r[0]=o*v+a*_+c*C,r[3]=o*g+a*y+c*w,r[6]=o*p+a*x+c*T,r[1]=l*v+h*_+f*C,r[4]=l*g+h*y+f*w,r[7]=l*p+h*x+f*T,r[2]=u*v+d*_+m*C,r[5]=u*g+d*y+m*w,r[8]=u*p+d*x+m*T,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-n*r*h+n*a*c+i*r*l-i*o*c}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],f=h*o-a*l,u=a*c-h*r,d=l*r-o*c,m=e*f+n*u+i*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/m;return t[0]=f*v,t[1]=(i*l-h*n)*v,t[2]=(a*n-i*o)*v,t[3]=u*v,t[4]=(h*e-i*c)*v,t[5]=(i*r-a*e)*v,t[6]=d*v,t[7]=(n*c-l*e)*v,t[8]=(o*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-i*l,i*c,-i*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Ho.makeScale(t,e)),this}rotate(t){return this.premultiply(Ho.makeRotation(-t)),this}translate(t,e){return this.premultiply(Ho.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Ho=new Ht;function Cu(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function So(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function gd(){const s=So("canvas");return s.style.display="block",s}const fl={};function tr(s){s in fl||(fl[s]=!0,console.warn(s))}function vd(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function _d(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function xd(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const jt={enabled:!0,workingColorSpace:Ps,spaces:{},convert:function(s,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ne&&(s.r=Xn(s.r),s.g=Xn(s.g),s.b=Xn(s.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(s.applyMatrix3(this.spaces[t].toXYZ),s.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ne&&(s.r=ps(s.r),s.g=ps(s.g),s.b=ps(s.b))),s},fromWorkingColorSpace:function(s,t){return this.convert(s,this.workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===oi?Co:this.spaces[s].transfer},getLuminanceCoefficients:function(s,t=this.workingColorSpace){return s.fromArray(this.spaces[t].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,t,e){return s.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function Xn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ps(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const dl=[.64,.33,.3,.6,.15,.06],pl=[.2126,.7152,.0722],ml=[.3127,.329],gl=new Ht().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),vl=new Ht().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);jt.define({[Ps]:{primaries:dl,whitePoint:ml,transfer:Co,toXYZ:gl,fromXYZ:vl,luminanceCoefficients:pl,workingColorSpaceConfig:{unpackColorSpace:Ue},outputColorSpaceConfig:{drawingBufferColorSpace:Ue}},[Ue]:{primaries:dl,whitePoint:ml,transfer:ne,toXYZ:gl,fromXYZ:vl,luminanceCoefficients:pl,outputColorSpaceConfig:{drawingBufferColorSpace:Ue}}});let ki;class yd{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{ki===void 0&&(ki=So("canvas")),ki.width=t.width,ki.height=t.height;const n=ki.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=ki}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=So("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Xn(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Xn(e[n]/255)*255):e[n]=Xn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Md=0;class Ru{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Md++}),this.uuid=Is(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Wo(i[o].image)):r.push(Wo(i[o]))}else r=Wo(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Wo(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?yd.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Sd=0;class ze extends Ls{constructor(t=ze.DEFAULT_IMAGE,e=ze.DEFAULT_MAPPING,n=Ri,i=Ri,r=wn,o=Pi,a=en,c=An,l=ze.DEFAULT_ANISOTROPY,h=oi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Sd++}),this.uuid=Is(),this.name="",this.source=new Ru(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ct(0,0),this.repeat=new ct(1,1),this.center=new ct(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==gu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ja:t.x=t.x-Math.floor(t.x);break;case Ri:t.x=t.x<0?0:1;break;case Za:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ja:t.y=t.y-Math.floor(t.y);break;case Ri:t.y=t.y<0?0:1;break;case Za:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}ze.DEFAULT_IMAGE=null;ze.DEFAULT_MAPPING=gu;ze.DEFAULT_ANISOTROPY=1;class de{constructor(t=0,e=0,n=0,i=1){de.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const c=t.elements,l=c[0],h=c[4],f=c[8],u=c[1],d=c[5],m=c[9],v=c[2],g=c[6],p=c[10];if(Math.abs(h-u)<.01&&Math.abs(f-v)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+v)<.1&&Math.abs(m+g)<.1&&Math.abs(l+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(l+1)/2,x=(d+1)/2,C=(p+1)/2,w=(h+u)/4,T=(f+v)/4,R=(m+g)/4;return y>x&&y>C?y<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(y),i=w/n,r=T/n):x>C?x<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(x),n=w/i,r=R/i):C<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(C),n=T/r,i=R/r),this.set(n,i,r,e),this}let _=Math.sqrt((g-m)*(g-m)+(f-v)*(f-v)+(u-h)*(u-h));return Math.abs(_)<.001&&(_=1),this.x=(g-m)/_,this.y=(f-v)/_,this.z=(u-h)/_,this.w=Math.acos((l+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Ed extends Ls{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new de(0,0,t,e),this.scissorTest=!1,this.viewport=new de(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new ze(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Ru(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $n extends Ed{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Pu extends ze{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=$e,this.minFilter=$e,this.wrapR=Ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class wd extends ze{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=$e,this.minFilter=$e,this.wrapR=Ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}let sn=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let c=n[i+0],l=n[i+1],h=n[i+2],f=n[i+3];const u=r[o+0],d=r[o+1],m=r[o+2],v=r[o+3];if(a===0){t[e+0]=c,t[e+1]=l,t[e+2]=h,t[e+3]=f;return}if(a===1){t[e+0]=u,t[e+1]=d,t[e+2]=m,t[e+3]=v;return}if(f!==v||c!==u||l!==d||h!==m){let g=1-a;const p=c*u+l*d+h*m+f*v,_=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const C=Math.sqrt(y),w=Math.atan2(C,p*_);g=Math.sin(g*w)/C,a=Math.sin(a*w)/C}const x=a*_;if(c=c*g+u*x,l=l*g+d*x,h=h*g+m*x,f=f*g+v*x,g===1-a){const C=1/Math.sqrt(c*c+l*l+h*h+f*f);c*=C,l*=C,h*=C,f*=C}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,i,r,o){const a=n[i],c=n[i+1],l=n[i+2],h=n[i+3],f=r[o],u=r[o+1],d=r[o+2],m=r[o+3];return t[e]=a*m+h*f+c*d-l*u,t[e+1]=c*m+h*u+l*f-a*d,t[e+2]=l*m+h*d+a*u-c*f,t[e+3]=h*m-a*f-c*u-l*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(i/2),f=a(r/2),u=c(n/2),d=c(i/2),m=c(r/2);switch(o){case"XYZ":this._x=u*h*f+l*d*m,this._y=l*d*f-u*h*m,this._z=l*h*m+u*d*f,this._w=l*h*f-u*d*m;break;case"YXZ":this._x=u*h*f+l*d*m,this._y=l*d*f-u*h*m,this._z=l*h*m-u*d*f,this._w=l*h*f+u*d*m;break;case"ZXY":this._x=u*h*f-l*d*m,this._y=l*d*f+u*h*m,this._z=l*h*m+u*d*f,this._w=l*h*f-u*d*m;break;case"ZYX":this._x=u*h*f-l*d*m,this._y=l*d*f+u*h*m,this._z=l*h*m-u*d*f,this._w=l*h*f+u*d*m;break;case"YZX":this._x=u*h*f+l*d*m,this._y=l*d*f+u*h*m,this._z=l*h*m-u*d*f,this._w=l*h*f-u*d*m;break;case"XZY":this._x=u*h*f-l*d*m,this._y=l*d*f-u*h*m,this._z=l*h*m+u*d*f,this._w=l*h*f+u*d*m;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],f=e[10],u=n+a+f;if(u>0){const d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-c)*d,this._y=(r-l)*d,this._z=(o-i)*d}else if(n>a&&n>f){const d=2*Math.sqrt(1+n-a-f);this._w=(h-c)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(r+l)/d}else if(a>f){const d=2*Math.sqrt(1+a-n-f);this._w=(r-l)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(c+h)/d}else{const d=2*Math.sqrt(1+f-n-a);this._w=(o-i)/d,this._x=(r+l)/d,this._y=(c+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Le(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=n*h+o*a+i*l-r*c,this._y=i*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-i*a,this._w=o*h-n*a-i*c-r*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+i*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const c=1-a*a;if(c<=Number.EPSILON){const d=1-e;return this._w=d*o+e*this._w,this._x=d*n+e*this._x,this._y=d*i+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,a),f=Math.sin((1-e)*h)/l,u=Math.sin(e*h)/l;return this._w=o*f+this._w*u,this._x=n*f+this._x*u,this._y=i*f+this._y*u,this._z=r*f+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}};class U{constructor(t=0,e=0,n=0){U.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(_l.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(_l.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*i-a*n),h=2*(a*e-r*i),f=2*(r*n-o*e);return this.x=e+c*l+o*f-a*h,this.y=n+c*h+a*l-r*f,this.z=i+c*f+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return qo.copy(this).projectOnVector(t),this.sub(qo)}reflect(t){return this.sub(qo.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const qo=new U,_l=new sn;class pr{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(cn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(cn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=cn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,cn):cn.fromBufferAttribute(r,o),cn.applyMatrix4(t.matrixWorld),this.expandByPoint(cn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Sr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Sr.copy(n.boundingBox)),Sr.applyMatrix4(t.matrixWorld),this.union(Sr)}const i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,cn),cn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Vs),Er.subVectors(this.max,Vs),Vi.subVectors(t.a,Vs),Gi.subVectors(t.b,Vs),Hi.subVectors(t.c,Vs),Kn.subVectors(Gi,Vi),Jn.subVectors(Hi,Gi),mi.subVectors(Vi,Hi);let e=[0,-Kn.z,Kn.y,0,-Jn.z,Jn.y,0,-mi.z,mi.y,Kn.z,0,-Kn.x,Jn.z,0,-Jn.x,mi.z,0,-mi.x,-Kn.y,Kn.x,0,-Jn.y,Jn.x,0,-mi.y,mi.x,0];return!Xo(e,Vi,Gi,Hi,Er)||(e=[1,0,0,0,1,0,0,0,1],!Xo(e,Vi,Gi,Hi,Er))?!1:(wr.crossVectors(Kn,Jn),e=[wr.x,wr.y,wr.z],Xo(e,Vi,Gi,Hi,Er))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,cn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(cn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(In[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),In[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),In[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),In[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),In[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),In[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),In[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),In[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(In),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const In=[new U,new U,new U,new U,new U,new U,new U,new U],cn=new U,Sr=new pr,Vi=new U,Gi=new U,Hi=new U,Kn=new U,Jn=new U,mi=new U,Vs=new U,Er=new U,wr=new U,gi=new U;function Xo(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){gi.fromArray(s,r);const a=i.x*Math.abs(gi.x)+i.y*Math.abs(gi.y)+i.z*Math.abs(gi.z),c=t.dot(gi),l=e.dot(gi),h=n.dot(gi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const bd=new pr,Gs=new U,Yo=new U;let Ro=class{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):bd.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Gs.subVectors(t,this.center);const e=Gs.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Gs,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Yo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Gs.copy(t.center).add(Yo)),this.expandByPoint(Gs.copy(t.center).sub(Yo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}};const Nn=new U,$o=new U,br=new U,Qn=new U,jo=new U,Tr=new U,Zo=new U;let Lu=class{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Nn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Nn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Nn.copy(this.origin).addScaledVector(this.direction,e),Nn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){$o.copy(t).add(e).multiplyScalar(.5),br.copy(e).sub(t).normalize(),Qn.copy(this.origin).sub($o);const r=t.distanceTo(e)*.5,o=-this.direction.dot(br),a=Qn.dot(this.direction),c=-Qn.dot(br),l=Qn.lengthSq(),h=Math.abs(1-o*o);let f,u,d,m;if(h>0)if(f=o*c-a,u=o*a-c,m=r*h,f>=0)if(u>=-m)if(u<=m){const v=1/h;f*=v,u*=v,d=f*(f+o*u+2*a)+u*(o*f+u+2*c)+l}else u=r,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*c)+l;else u=-r,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*c)+l;else u<=-m?(f=Math.max(0,-(-o*r+a)),u=f>0?-r:Math.min(Math.max(-r,-c),r),d=-f*f+u*(u+2*c)+l):u<=m?(f=0,u=Math.min(Math.max(-r,-c),r),d=u*(u+2*c)+l):(f=Math.max(0,-(o*r+a)),u=f>0?r:Math.min(Math.max(-r,-c),r),d=-f*f+u*(u+2*c)+l);else u=o>0?-r:r,f=Math.max(0,-(o*u+a)),d=-f*f+u*(u+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,f),i&&i.copy($o).addScaledVector(br,u),d}intersectSphere(t,e){Nn.subVectors(t.center,this.origin);const n=Nn.dot(this.direction),i=Nn.dot(Nn)-n*n,r=t.radius*t.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return l>=0?(n=(t.min.x-u.x)*l,i=(t.max.x-u.x)*l):(n=(t.max.x-u.x)*l,i=(t.min.x-u.x)*l),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),f>=0?(a=(t.min.z-u.z)*f,c=(t.max.z-u.z)*f):(a=(t.max.z-u.z)*f,c=(t.min.z-u.z)*f),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Nn)!==null}intersectTriangle(t,e,n,i,r){jo.subVectors(e,t),Tr.subVectors(n,t),Zo.crossVectors(jo,Tr);let o=this.direction.dot(Zo),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Qn.subVectors(this.origin,t);const c=a*this.direction.dot(Tr.crossVectors(Qn,Tr));if(c<0)return null;const l=a*this.direction.dot(jo.cross(Qn));if(l<0||c+l>o)return null;const h=-a*Qn.dot(Zo);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}};class Zt{constructor(t,e,n,i,r,o,a,c,l,h,f,u,d,m,v,g){Zt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,c,l,h,f,u,d,m,v,g)}set(t,e,n,i,r,o,a,c,l,h,f,u,d,m,v,g){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=f,p[14]=u,p[3]=d,p[7]=m,p[11]=v,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Zt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/Wi.setFromMatrixColumn(t,0).length(),r=1/Wi.setFromMatrixColumn(t,1).length(),o=1/Wi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){const u=o*h,d=o*f,m=a*h,v=a*f;e[0]=c*h,e[4]=-c*f,e[8]=l,e[1]=d+m*l,e[5]=u-v*l,e[9]=-a*c,e[2]=v-u*l,e[6]=m+d*l,e[10]=o*c}else if(t.order==="YXZ"){const u=c*h,d=c*f,m=l*h,v=l*f;e[0]=u+v*a,e[4]=m*a-d,e[8]=o*l,e[1]=o*f,e[5]=o*h,e[9]=-a,e[2]=d*a-m,e[6]=v+u*a,e[10]=o*c}else if(t.order==="ZXY"){const u=c*h,d=c*f,m=l*h,v=l*f;e[0]=u-v*a,e[4]=-o*f,e[8]=m+d*a,e[1]=d+m*a,e[5]=o*h,e[9]=v-u*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){const u=o*h,d=o*f,m=a*h,v=a*f;e[0]=c*h,e[4]=m*l-d,e[8]=u*l+v,e[1]=c*f,e[5]=v*l+u,e[9]=d*l-m,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){const u=o*c,d=o*l,m=a*c,v=a*l;e[0]=c*h,e[4]=v-u*f,e[8]=m*f+d,e[1]=f,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=d*f+m,e[10]=u-v*f}else if(t.order==="XZY"){const u=o*c,d=o*l,m=a*c,v=a*l;e[0]=c*h,e[4]=-f,e[8]=l*h,e[1]=u*f+v,e[5]=o*h,e[9]=d*f-m,e[2]=m*f-d,e[6]=a*h,e[10]=v*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Td,t,Ad)}lookAt(t,e,n){const i=this.elements;return We.subVectors(t,e),We.lengthSq()===0&&(We.z=1),We.normalize(),ti.crossVectors(n,We),ti.lengthSq()===0&&(Math.abs(n.z)===1?We.x+=1e-4:We.z+=1e-4,We.normalize(),ti.crossVectors(n,We)),ti.normalize(),Ar.crossVectors(We,ti),i[0]=ti.x,i[4]=Ar.x,i[8]=We.x,i[1]=ti.y,i[5]=Ar.y,i[9]=We.y,i[2]=ti.z,i[6]=Ar.z,i[10]=We.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],f=n[5],u=n[9],d=n[13],m=n[2],v=n[6],g=n[10],p=n[14],_=n[3],y=n[7],x=n[11],C=n[15],w=i[0],T=i[4],R=i[8],S=i[12],M=i[1],P=i[5],O=i[9],I=i[13],F=i[2],z=i[6],D=i[10],Y=i[14],G=i[3],X=i[7],tt=i[11],st=i[15];return r[0]=o*w+a*M+c*F+l*G,r[4]=o*T+a*P+c*z+l*X,r[8]=o*R+a*O+c*D+l*tt,r[12]=o*S+a*I+c*Y+l*st,r[1]=h*w+f*M+u*F+d*G,r[5]=h*T+f*P+u*z+d*X,r[9]=h*R+f*O+u*D+d*tt,r[13]=h*S+f*I+u*Y+d*st,r[2]=m*w+v*M+g*F+p*G,r[6]=m*T+v*P+g*z+p*X,r[10]=m*R+v*O+g*D+p*tt,r[14]=m*S+v*I+g*Y+p*st,r[3]=_*w+y*M+x*F+C*G,r[7]=_*T+y*P+x*z+C*X,r[11]=_*R+y*O+x*D+C*tt,r[15]=_*S+y*I+x*Y+C*st,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],f=t[6],u=t[10],d=t[14],m=t[3],v=t[7],g=t[11],p=t[15];return m*(+r*c*f-i*l*f-r*a*u+n*l*u+i*a*d-n*c*d)+v*(+e*c*d-e*l*u+r*o*u-i*o*d+i*l*h-r*c*h)+g*(+e*l*f-e*a*d-r*o*f+n*o*d+r*a*h-n*l*h)+p*(-i*a*h-e*c*f+e*a*u+i*o*f-n*o*u+n*c*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],f=t[9],u=t[10],d=t[11],m=t[12],v=t[13],g=t[14],p=t[15],_=f*g*l-v*u*l+v*c*d-a*g*d-f*c*p+a*u*p,y=m*u*l-h*g*l-m*c*d+o*g*d+h*c*p-o*u*p,x=h*v*l-m*f*l+m*a*d-o*v*d-h*a*p+o*f*p,C=m*f*c-h*v*c-m*a*u+o*v*u+h*a*g-o*f*g,w=e*_+n*y+i*x+r*C;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/w;return t[0]=_*T,t[1]=(v*u*r-f*g*r-v*i*d+n*g*d+f*i*p-n*u*p)*T,t[2]=(a*g*r-v*c*r+v*i*l-n*g*l-a*i*p+n*c*p)*T,t[3]=(f*c*r-a*u*r-f*i*l+n*u*l+a*i*d-n*c*d)*T,t[4]=y*T,t[5]=(h*g*r-m*u*r+m*i*d-e*g*d-h*i*p+e*u*p)*T,t[6]=(m*c*r-o*g*r-m*i*l+e*g*l+o*i*p-e*c*p)*T,t[7]=(o*u*r-h*c*r+h*i*l-e*u*l-o*i*d+e*c*d)*T,t[8]=x*T,t[9]=(m*f*r-h*v*r-m*n*d+e*v*d+h*n*p-e*f*p)*T,t[10]=(o*v*r-m*a*r+m*n*l-e*v*l-o*n*p+e*a*p)*T,t[11]=(h*a*r-o*f*r-h*n*l+e*f*l+o*n*d-e*a*d)*T,t[12]=C*T,t[13]=(h*v*i-m*f*i+m*n*u-e*v*u-h*n*g+e*f*g)*T,t[14]=(m*a*i-o*v*i-m*n*c+e*v*c+o*n*g-e*a*g)*T,t[15]=(o*f*i-h*a*i+h*n*c-e*f*c-o*n*u+e*a*u)*T,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,h*a+n,h*c-i*o,0,l*c-i*a,h*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,f=a+a,u=r*l,d=r*h,m=r*f,v=o*h,g=o*f,p=a*f,_=c*l,y=c*h,x=c*f,C=n.x,w=n.y,T=n.z;return i[0]=(1-(v+p))*C,i[1]=(d+x)*C,i[2]=(m-y)*C,i[3]=0,i[4]=(d-x)*w,i[5]=(1-(u+p))*w,i[6]=(g+_)*w,i[7]=0,i[8]=(m+y)*T,i[9]=(g-_)*T,i[10]=(1-(u+v))*T,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=Wi.set(i[0],i[1],i[2]).length();const o=Wi.set(i[4],i[5],i[6]).length(),a=Wi.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],ln.copy(this);const l=1/r,h=1/o,f=1/a;return ln.elements[0]*=l,ln.elements[1]*=l,ln.elements[2]*=l,ln.elements[4]*=h,ln.elements[5]*=h,ln.elements[6]*=h,ln.elements[8]*=f,ln.elements[9]*=f,ln.elements[10]*=f,e.setFromRotationMatrix(ln),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,i,r,o,a=qn){const c=this.elements,l=2*r/(e-t),h=2*r/(n-i),f=(e+t)/(e-t),u=(n+i)/(n-i);let d,m;if(a===qn)d=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(a===Mo)d=-o/(o-r),m=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=h,c[9]=u,c[13]=0,c[2]=0,c[6]=0,c[10]=d,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,o,a=qn){const c=this.elements,l=1/(e-t),h=1/(n-i),f=1/(o-r),u=(e+t)*l,d=(n+i)*h;let m,v;if(a===qn)m=(o+r)*f,v=-2*f;else if(a===Mo)m=r*f,v=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-u,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-d,c[2]=0,c[6]=0,c[10]=v,c[14]=-m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Wi=new U,ln=new Zt,Td=new U(0,0,0),Ad=new U(1,1,1),ti=new U,Ar=new U,We=new U,xl=new Zt,yl=new sn;class rn{constructor(t=0,e=0,n=0,i=rn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],o=i[4],a=i[8],c=i[1],l=i[5],h=i[9],f=i[2],u=i[6],d=i[10];switch(e){case"XYZ":this._y=Math.asin(Le(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Le(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Le(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Le(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Le(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Le(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return xl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(xl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return yl.setFromEuler(this),this.setFromQuaternion(yl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}rn.DEFAULT_ORDER="XYZ";class Oc{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Cd=0;const Ml=new U,qi=new sn,Dn=new Zt,Cr=new U,Hs=new U,Rd=new U,Pd=new sn,Sl=new U(1,0,0),El=new U(0,1,0),wl=new U(0,0,1),bl={type:"added"},Ld={type:"removed"},Xi={type:"childadded",child:null},Ko={type:"childremoved",child:null};class Ge extends Ls{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Cd++}),this.uuid=Is(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ge.DEFAULT_UP.clone();const t=new U,e=new rn,n=new sn,i=new U(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Zt},normalMatrix:{value:new Ht}}),this.matrix=new Zt,this.matrixWorld=new Zt,this.matrixAutoUpdate=Ge.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Oc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return qi.setFromAxisAngle(t,e),this.quaternion.multiply(qi),this}rotateOnWorldAxis(t,e){return qi.setFromAxisAngle(t,e),this.quaternion.premultiply(qi),this}rotateX(t){return this.rotateOnAxis(Sl,t)}rotateY(t){return this.rotateOnAxis(El,t)}rotateZ(t){return this.rotateOnAxis(wl,t)}translateOnAxis(t,e){return Ml.copy(t).applyQuaternion(this.quaternion),this.position.add(Ml.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Sl,t)}translateY(t){return this.translateOnAxis(El,t)}translateZ(t){return this.translateOnAxis(wl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Dn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Cr.copy(t):Cr.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Hs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Dn.lookAt(Hs,Cr,this.up):Dn.lookAt(Cr,Hs,this.up),this.quaternion.setFromRotationMatrix(Dn),i&&(Dn.extractRotation(i.matrixWorld),qi.setFromRotationMatrix(Dn),this.quaternion.premultiply(qi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(bl),Xi.child=t,this.dispatchEvent(Xi),Xi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Ld),Ko.child=t,this.dispatchEvent(Ko),Ko.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Dn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Dn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Dn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(bl),Xi.child=t,this.dispatchEvent(Xi),Xi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hs,t,Rd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hs,Pd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const f=c[l];r(t.shapes,f)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];i.animations.push(r(t.animations,c))}}if(e){const a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),f=o(t.shapes),u=o(t.skeletons),d=o(t.animations),m=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),u.length>0&&(n.skeletons=u),d.length>0&&(n.animations=d),m.length>0&&(n.nodes=m)}return n.object=i,n;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Ge.DEFAULT_UP=new U(0,1,0);Ge.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ge.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const hn=new U,Un=new U,Jo=new U,Fn=new U,Yi=new U,$i=new U,Tl=new U,Qo=new U,ta=new U,ea=new U,na=new de,ia=new de,sa=new de;class mn{constructor(t=new U,e=new U,n=new U){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),hn.subVectors(t,e),i.cross(hn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){hn.subVectors(i,e),Un.subVectors(n,e),Jo.subVectors(t,e);const o=hn.dot(hn),a=hn.dot(Un),c=hn.dot(Jo),l=Un.dot(Un),h=Un.dot(Jo),f=o*l-a*a;if(f===0)return r.set(0,0,0),null;const u=1/f,d=(l*c-a*h)*u,m=(o*h-a*c)*u;return r.set(1-d-m,m,d)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Fn)===null?!1:Fn.x>=0&&Fn.y>=0&&Fn.x+Fn.y<=1}static getInterpolation(t,e,n,i,r,o,a,c){return this.getBarycoord(t,e,n,i,Fn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Fn.x),c.addScaledVector(o,Fn.y),c.addScaledVector(a,Fn.z),c)}static getInterpolatedAttribute(t,e,n,i,r,o){return na.setScalar(0),ia.setScalar(0),sa.setScalar(0),na.fromBufferAttribute(t,e),ia.fromBufferAttribute(t,n),sa.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(na,r.x),o.addScaledVector(ia,r.y),o.addScaledVector(sa,r.z),o}static isFrontFacing(t,e,n,i){return hn.subVectors(n,e),Un.subVectors(t,e),hn.cross(Un).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return hn.subVectors(this.c,this.b),Un.subVectors(this.a,this.b),hn.cross(Un).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return mn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return mn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return mn.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return mn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return mn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let o,a;Yi.subVectors(i,n),$i.subVectors(r,n),Qo.subVectors(t,n);const c=Yi.dot(Qo),l=$i.dot(Qo);if(c<=0&&l<=0)return e.copy(n);ta.subVectors(t,i);const h=Yi.dot(ta),f=$i.dot(ta);if(h>=0&&f<=h)return e.copy(i);const u=c*f-h*l;if(u<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(n).addScaledVector(Yi,o);ea.subVectors(t,r);const d=Yi.dot(ea),m=$i.dot(ea);if(m>=0&&d<=m)return e.copy(r);const v=d*l-c*m;if(v<=0&&l>=0&&m<=0)return a=l/(l-m),e.copy(n).addScaledVector($i,a);const g=h*m-d*f;if(g<=0&&f-h>=0&&d-m>=0)return Tl.subVectors(r,i),a=(f-h)/(f-h+(d-m)),e.copy(i).addScaledVector(Tl,a);const p=1/(g+v+u);return o=v*p,a=u*p,e.copy(n).addScaledVector(Yi,o).addScaledVector($i,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Iu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ei={h:0,s:0,l:0},Rr={h:0,s:0,l:0};function ra(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class zt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ue){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,jt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=jt.workingColorSpace){return this.r=t,this.g=e,this.b=n,jt.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=jt.workingColorSpace){if(t=md(t,1),e=Le(e,0,1),n=Le(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=ra(o,r,t+1/3),this.g=ra(o,r,t),this.b=ra(o,r,t-1/3)}return jt.toWorkingColorSpace(this,i),this}setStyle(t,e=Ue){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ue){const n=Iu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Xn(t.r),this.g=Xn(t.g),this.b=Xn(t.b),this}copyLinearToSRGB(t){return this.r=ps(t.r),this.g=ps(t.g),this.b=ps(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ue){return jt.fromWorkingColorSpace(Pe.copy(this),t),Math.round(Le(Pe.r*255,0,255))*65536+Math.round(Le(Pe.g*255,0,255))*256+Math.round(Le(Pe.b*255,0,255))}getHexString(t=Ue){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=jt.workingColorSpace){jt.fromWorkingColorSpace(Pe.copy(this),e);const n=Pe.r,i=Pe.g,r=Pe.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const f=o-a;switch(l=h<=.5?f/(o+a):f/(2-o-a),o){case n:c=(i-r)/f+(i<r?6:0);break;case i:c=(r-n)/f+2;break;case r:c=(n-i)/f+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=jt.workingColorSpace){return jt.fromWorkingColorSpace(Pe.copy(this),e),t.r=Pe.r,t.g=Pe.g,t.b=Pe.b,t}getStyle(t=Ue){jt.fromWorkingColorSpace(Pe.copy(this),t);const e=Pe.r,n=Pe.g,i=Pe.b;return t!==Ue?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(ei),this.setHSL(ei.h+t,ei.s+e,ei.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ei),t.getHSL(Rr);const n=Go(ei.h,Rr.h,e),i=Go(ei.s,Rr.s,e),r=Go(ei.l,Rr.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Pe=new zt;zt.NAMES=Iu;let Id=0,Po=class extends Ls{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Id++}),this.uuid=Is(),this.name="",this.blending=fs,this.side=Yn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ba,this.blendDst=ar,this.blendEquation=Ti,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new zt(0,0,0),this.blendAlpha=0,this.depthFunc=_s,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ll,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Bi,this.stencilZFail=Bi,this.stencilZPass=Bi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==fs&&(n.blending=this.blending),this.side!==Yn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ba&&(n.blendSrc=this.blendSrc),this.blendDst!==ar&&(n.blendDst=this.blendDst),this.blendEquation!==Ti&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==_s&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ll&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Bi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Bi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Bi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(e){const r=i(t.textures),o=i(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}};class Nu extends Po{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new zt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.combine=mu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const pe=new U,Pr=new ct;class xe{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=hl,this.updateRanges=[],this.gpuType=bn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Pr.fromBufferAttribute(this,e),Pr.applyMatrix3(t),this.setXY(e,Pr.x,Pr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.applyMatrix3(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.applyMatrix4(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.applyNormalMatrix(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.transformDirection(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ks(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Be(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ks(e,this.array)),e}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ks(e,this.array)),e}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ks(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ks(e,this.array)),e}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),i=Be(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),i=Be(i,this.array),r=Be(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==hl&&(t.usage=this.usage),t}}class Du extends xe{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Uu extends xe{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class le extends xe{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Nd=0;const Ke=new Zt,oa=new Ge,ji=new U,qe=new pr,Ws=new pr,we=new U;class be extends Ls{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nd++}),this.uuid=Is(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Cu(t)?Uu:Du)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ht().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Ke.makeRotationFromQuaternion(t),this.applyMatrix4(Ke),this}rotateX(t){return Ke.makeRotationX(t),this.applyMatrix4(Ke),this}rotateY(t){return Ke.makeRotationY(t),this.applyMatrix4(Ke),this}rotateZ(t){return Ke.makeRotationZ(t),this.applyMatrix4(Ke),this}translate(t,e,n){return Ke.makeTranslation(t,e,n),this.applyMatrix4(Ke),this}scale(t,e,n){return Ke.makeScale(t,e,n),this.applyMatrix4(Ke),this}lookAt(t){return oa.lookAt(t),oa.updateMatrix(),this.applyMatrix4(oa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ji).negate(),this.translate(ji.x,ji.y,ji.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,r=t.length;i<r;i++){const o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new le(n,3))}else{for(let n=0,i=e.count;n<i;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];qe.setFromBufferAttribute(r),this.morphTargetsRelative?(we.addVectors(this.boundingBox.min,qe.min),this.boundingBox.expandByPoint(we),we.addVectors(this.boundingBox.max,qe.max),this.boundingBox.expandByPoint(we)):(this.boundingBox.expandByPoint(qe.min),this.boundingBox.expandByPoint(qe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ro);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){const n=this.boundingSphere.center;if(qe.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Ws.setFromBufferAttribute(a),this.morphTargetsRelative?(we.addVectors(qe.min,Ws.min),qe.expandByPoint(we),we.addVectors(qe.max,Ws.max),qe.expandByPoint(we)):(qe.expandByPoint(Ws.min),qe.expandByPoint(Ws.max))}qe.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)we.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(we));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)we.fromBufferAttribute(a,l),c&&(ji.fromBufferAttribute(t,l),we.add(ji)),i=Math.max(i,n.distanceToSquared(we))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xe(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let R=0;R<n.count;R++)a[R]=new U,c[R]=new U;const l=new U,h=new U,f=new U,u=new ct,d=new ct,m=new ct,v=new U,g=new U;function p(R,S,M){l.fromBufferAttribute(n,R),h.fromBufferAttribute(n,S),f.fromBufferAttribute(n,M),u.fromBufferAttribute(r,R),d.fromBufferAttribute(r,S),m.fromBufferAttribute(r,M),h.sub(l),f.sub(l),d.sub(u),m.sub(u);const P=1/(d.x*m.y-m.x*d.y);isFinite(P)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(f,-d.y).multiplyScalar(P),g.copy(f).multiplyScalar(d.x).addScaledVector(h,-m.x).multiplyScalar(P),a[R].add(v),a[S].add(v),a[M].add(v),c[R].add(g),c[S].add(g),c[M].add(g))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let R=0,S=_.length;R<S;++R){const M=_[R],P=M.start,O=M.count;for(let I=P,F=P+O;I<F;I+=3)p(t.getX(I+0),t.getX(I+1),t.getX(I+2))}const y=new U,x=new U,C=new U,w=new U;function T(R){C.fromBufferAttribute(i,R),w.copy(C);const S=a[R];y.copy(S),y.sub(C.multiplyScalar(C.dot(S))).normalize(),x.crossVectors(w,S);const P=x.dot(c[R])<0?-1:1;o.setXYZW(R,y.x,y.y,y.z,P)}for(let R=0,S=_.length;R<S;++R){const M=_[R],P=M.start,O=M.count;for(let I=P,F=P+O;I<F;I+=3)T(t.getX(I+0)),T(t.getX(I+1)),T(t.getX(I+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new xe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,d=n.count;u<d;u++)n.setXYZ(u,0,0,0);const i=new U,r=new U,o=new U,a=new U,c=new U,l=new U,h=new U,f=new U;if(t)for(let u=0,d=t.count;u<d;u+=3){const m=t.getX(u+0),v=t.getX(u+1),g=t.getX(u+2);i.fromBufferAttribute(e,m),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,g),h.subVectors(o,r),f.subVectors(i,r),h.cross(f),a.fromBufferAttribute(n,m),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,g),a.add(h),c.add(h),l.add(h),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let u=0,d=e.count;u<d;u+=3)i.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),f.subVectors(i,r),h.cross(f),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)we.fromBufferAttribute(t,e),we.normalize(),t.setXYZ(e,we.x,we.y,we.z)}toNonIndexed(){function t(a,c){const l=a.array,h=a.itemSize,f=a.normalized,u=new l.constructor(c.length*h);let d=0,m=0;for(let v=0,g=c.length;v<g;v++){a.isInterleavedBufferAttribute?d=c[v]*a.data.stride+a.offset:d=c[v]*h;for(let p=0;p<h;p++)u[m++]=l[d++]}return new xe(u,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new be,n=this.index.array,i=this.attributes;for(const a in i){const c=i[a],l=t(c,n);e.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,f=l.length;h<f;h++){const u=l[h],d=t(u,n);c.push(d)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const c in n){const l=n[c];t.data.attributes[c]=l.toJSON(t.data)}const i={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let f=0,u=l.length;f<u;f++){const d=l[f];h.push(d.toJSON(t.data))}h.length>0&&(i[c]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const l in i){const h=i[l];this.setAttribute(l,h.clone(e))}const r=t.morphAttributes;for(const l in r){const h=[],f=r[l];for(let u=0,d=f.length;u<d;u++)h.push(f[u].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,h=o.length;l<h;l++){const f=o[l];this.addGroup(f.start,f.count,f.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Al=new Zt,vi=new Lu,Lr=new Ro,Cl=new U,Ir=new U,Nr=new U,Dr=new U,aa=new U,Ur=new U,Rl=new U,Fr=new U;class ce extends Ge{constructor(t=new be,e=new Nu){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const a=this.morphTargetInfluences;if(r&&a){Ur.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],f=r[c];h!==0&&(aa.fromBufferAttribute(f,t),o?Ur.addScaledVector(aa,h):Ur.addScaledVector(aa.sub(e),h))}e.add(Ur)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Lr.copy(n.boundingSphere),Lr.applyMatrix4(r),vi.copy(t.ray).recast(t.near),!(Lr.containsPoint(vi.origin)===!1&&(vi.intersectSphere(Lr,Cl)===null||vi.origin.distanceToSquared(Cl)>(t.far-t.near)**2))&&(Al.copy(r).invert(),vi.copy(t.ray).applyMatrix4(Al),!(n.boundingBox!==null&&vi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,vi)))}_computeIntersections(t,e,n){let i;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,v=u.length;m<v;m++){const g=u[m],p=o[g.materialIndex],_=Math.max(g.start,d.start),y=Math.min(a.count,Math.min(g.start+g.count,d.start+d.count));for(let x=_,C=y;x<C;x+=3){const w=a.getX(x),T=a.getX(x+1),R=a.getX(x+2);i=zr(this,p,t,n,l,h,f,w,T,R),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=g.materialIndex,e.push(i))}}else{const m=Math.max(0,d.start),v=Math.min(a.count,d.start+d.count);for(let g=m,p=v;g<p;g+=3){const _=a.getX(g),y=a.getX(g+1),x=a.getX(g+2);i=zr(this,o,t,n,l,h,f,_,y,x),i&&(i.faceIndex=Math.floor(g/3),e.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let m=0,v=u.length;m<v;m++){const g=u[m],p=o[g.materialIndex],_=Math.max(g.start,d.start),y=Math.min(c.count,Math.min(g.start+g.count,d.start+d.count));for(let x=_,C=y;x<C;x+=3){const w=x,T=x+1,R=x+2;i=zr(this,p,t,n,l,h,f,w,T,R),i&&(i.faceIndex=Math.floor(x/3),i.face.materialIndex=g.materialIndex,e.push(i))}}else{const m=Math.max(0,d.start),v=Math.min(c.count,d.start+d.count);for(let g=m,p=v;g<p;g+=3){const _=g,y=g+1,x=g+2;i=zr(this,o,t,n,l,h,f,_,y,x),i&&(i.faceIndex=Math.floor(g/3),e.push(i))}}}}function Dd(s,t,e,n,i,r,o,a){let c;if(t.side===Ae?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,t.side===Yn,a),c===null)return null;Fr.copy(a),Fr.applyMatrix4(s.matrixWorld);const l=e.ray.origin.distanceTo(Fr);return l<e.near||l>e.far?null:{distance:l,point:Fr.clone(),object:s}}function zr(s,t,e,n,i,r,o,a,c,l){s.getVertexPosition(a,Ir),s.getVertexPosition(c,Nr),s.getVertexPosition(l,Dr);const h=Dd(s,t,e,n,Ir,Nr,Dr,Rl);if(h){const f=new U;mn.getBarycoord(Rl,Ir,Nr,Dr,f),i&&(h.uv=mn.getInterpolatedAttribute(i,a,c,l,f,new ct)),r&&(h.uv1=mn.getInterpolatedAttribute(r,a,c,l,f,new ct)),o&&(h.normal=mn.getInterpolatedAttribute(o,a,c,l,f,new U),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:c,c:l,normal:new U,materialIndex:0};mn.getNormal(Ir,Nr,Dr,u.normal),h.face=u,h.barycoord=f}return h}class Fi extends be{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],f=[];let u=0,d=0;m("z","y","x",-1,-1,n,e,t,o,r,0),m("z","y","x",1,-1,n,e,-t,o,r,1),m("x","z","y",1,1,t,n,e,i,o,2),m("x","z","y",1,-1,t,n,-e,i,o,3),m("x","y","z",1,-1,t,e,n,i,r,4),m("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new le(l,3)),this.setAttribute("normal",new le(h,3)),this.setAttribute("uv",new le(f,2));function m(v,g,p,_,y,x,C,w,T,R,S){const M=x/T,P=C/R,O=x/2,I=C/2,F=w/2,z=T+1,D=R+1;let Y=0,G=0;const X=new U;for(let tt=0;tt<D;tt++){const st=tt*P-I;for(let J=0;J<z;J++){const Nt=J*M-O;X[v]=Nt*_,X[g]=st*y,X[p]=F,l.push(X.x,X.y,X.z),X[v]=0,X[g]=0,X[p]=w>0?1:-1,h.push(X.x,X.y,X.z),f.push(J/T),f.push(1-tt/R),Y+=1}}for(let tt=0;tt<R;tt++)for(let st=0;st<T;st++){const J=u+st+z*tt,Nt=u+st+z*(tt+1),$=u+(st+1)+z*(tt+1),nt=u+(st+1)+z*tt;c.push(J,Nt,nt),c.push(Nt,$,nt),G+=6}a.addGroup(d,G,S),d+=G,u+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Fi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Es(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function De(s){const t={};for(let e=0;e<s.length;e++){const n=Es(s[e]);for(const i in n)t[i]=n[i]}return t}function Ud(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Fu(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:jt.workingColorSpace}const Lo={clone:Es,merge:De};var Fd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,zd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ie extends Po{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Fd,this.fragmentShader=zd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Es(t.uniforms),this.uniformsGroups=Ud(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class zu extends Ge{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Zt,this.projectionMatrix=new Zt,this.projectionMatrixInverse=new Zt,this.coordinateSystem=qn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ni=new U,Pl=new ct,Ll=new ct;class tn extends zu{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ec*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Vo*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ec*2*Math.atan(Math.tan(Vo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ni.x,ni.y).multiplyScalar(-t/ni.z),ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ni.x,ni.y).multiplyScalar(-t/ni.z)}getViewSize(t,e){return this.getViewBounds(t,Pl,Ll),e.subVectors(Ll,Pl)}setViewOffset(t,e,n,i,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Vo*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*i/c,e-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Zi=-90,Ki=1;class Od extends Ge{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new tn(Zi,Ki,t,e);i.layers=this.layers,this.add(i);const r=new tn(Zi,Ki,t,e);r.layers=this.layers,this.add(r);const o=new tn(Zi,Ki,t,e);o.layers=this.layers,this.add(o);const a=new tn(Zi,Ki,t,e);a.layers=this.layers,this.add(a);const c=new tn(Zi,Ki,t,e);c.layers=this.layers,this.add(c);const l=new tn(Zi,Ki,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,o,a,c]=e;for(const l of e)this.remove(l);if(t===qn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Mo)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,o),t.setRenderTarget(n,2,i),t.render(e,a),t.setRenderTarget(n,3,i),t.render(e,c),t.setRenderTarget(n,4,i),t.render(e,l),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(f,u,d),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}}class Ou extends ze{constructor(t,e,n,i,r,o,a,c,l,h){t=t!==void 0?t:[],e=e!==void 0?e:xs,super(t,e,n,i,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Bd extends $n{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new Ou(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:wn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Fi(5,5,5),r=new Ie({name:"CubemapFromEquirect",uniforms:Es(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ae,blending:hi});r.uniforms.tEquirect.value=e;const o=new ce(i,r),a=e.minFilter;return e.minFilter===Pi&&(e.minFilter=wn),new Od(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(r)}}const ca=new U,kd=new U,Vd=new Ht;let Ei=class{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=ca.subVectors(n,e).cross(kd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(ca),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Vd.getNormalMatrix(t),i=this.coplanarPoint(ca).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}};const _i=new Ro,Or=new U;class Bu{constructor(t=new Ei,e=new Ei,n=new Ei,i=new Ei,r=new Ei,o=new Ei){this.planes=[t,e,n,i,r,o]}set(t,e,n,i,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=qn){const n=this.planes,i=t.elements,r=i[0],o=i[1],a=i[2],c=i[3],l=i[4],h=i[5],f=i[6],u=i[7],d=i[8],m=i[9],v=i[10],g=i[11],p=i[12],_=i[13],y=i[14],x=i[15];if(n[0].setComponents(c-r,u-l,g-d,x-p).normalize(),n[1].setComponents(c+r,u+l,g+d,x+p).normalize(),n[2].setComponents(c+o,u+h,g+m,x+_).normalize(),n[3].setComponents(c-o,u-h,g-m,x-_).normalize(),n[4].setComponents(c-a,u-f,g-v,x-y).normalize(),e===qn)n[5].setComponents(c+a,u+f,g+v,x+y).normalize();else if(e===Mo)n[5].setComponents(a,f,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),_i.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),_i.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(_i)}intersectsSprite(t){return _i.center.set(0,0,0),_i.radius=.7071067811865476,_i.applyMatrix4(t.matrixWorld),this.intersectsSphere(_i)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(Or.x=i.normal.x>0?t.max.x:t.min.x,Or.y=i.normal.y>0?t.max.y:t.min.y,Or.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Or)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function ku(){let s=null,t=!1,e=null,n=null;function i(r,o){e(r,o),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Gd(s){const t=new WeakMap;function e(a,c){const l=a.array,h=a.usage,f=l.byteLength,u=s.createBuffer();s.bindBuffer(c,u),s.bufferData(c,l,h),a.onUploadCallback();let d;if(l instanceof Float32Array)d=s.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=s.SHORT;else if(l instanceof Uint32Array)d=s.UNSIGNED_INT;else if(l instanceof Int32Array)d=s.INT;else if(l instanceof Int8Array)d=s.BYTE;else if(l instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,c,l){const h=c.array,f=c.updateRanges;if(s.bindBuffer(l,a),f.length===0)s.bufferSubData(l,0,h);else{f.sort((d,m)=>d.start-m.start);let u=0;for(let d=1;d<f.length;d++){const m=f[u],v=f[d];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++u,f[u]=v)}f.length=u+1;for(let d=0,m=f.length;d<m;d++){const v=f[d];s.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);c&&(s.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:r,update:o}}class Ns extends be{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(i),l=a+1,h=c+1,f=t/a,u=e/c,d=[],m=[],v=[],g=[];for(let p=0;p<h;p++){const _=p*u-o;for(let y=0;y<l;y++){const x=y*f-r;m.push(x,-_,0),v.push(0,0,1),g.push(y/a),g.push(1-p/c)}}for(let p=0;p<c;p++)for(let _=0;_<a;_++){const y=_+l*p,x=_+l*(p+1),C=_+1+l*(p+1),w=_+1+l*p;d.push(y,x,w),d.push(x,C,w)}this.setIndex(d),this.setAttribute("position",new le(m,3)),this.setAttribute("normal",new le(v,3)),this.setAttribute("uv",new le(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ns(t.width,t.height,t.widthSegments,t.heightSegments)}}var Hd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Xd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,$d=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,jd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Zd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Kd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Jd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,tp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ep=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,np=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ip=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,sp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,op=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ap=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,cp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,lp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,hp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,up=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,fp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,dp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,pp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,mp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,vp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_p=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xp="gl_FragColor = linearToOutputTexel( gl_FragColor );",yp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Mp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Sp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Ep=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,wp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Tp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ap=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Cp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Rp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Pp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Lp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ip=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Np=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Dp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Up=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Fp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,zp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Op=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Bp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Vp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Gp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Hp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Wp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qp=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xp=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Yp=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$p=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Zp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Kp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Jp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Qp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,t0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,e0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,n0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,i0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,s0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,r0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,o0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,a0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,c0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,l0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,h0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,u0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,f0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,d0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,p0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,m0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,g0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,v0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,_0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,x0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,y0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,M0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,S0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,E0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,w0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,b0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,T0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,A0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,C0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,R0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,P0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,L0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,I0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,N0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,D0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,U0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,F0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,z0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,O0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,B0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,k0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,V0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const G0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,H0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,q0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,X0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Y0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,j0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Z0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,K0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,J0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Q0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,em=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,nm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,im=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,om=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,am=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,lm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,hm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,um=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,dm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,vm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_m=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ym=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:Hd,alphahash_pars_fragment:Wd,alphamap_fragment:qd,alphamap_pars_fragment:Xd,alphatest_fragment:Yd,alphatest_pars_fragment:$d,aomap_fragment:jd,aomap_pars_fragment:Zd,batching_pars_vertex:Kd,batching_vertex:Jd,begin_vertex:Qd,beginnormal_vertex:tp,bsdfs:ep,iridescence_fragment:np,bumpmap_pars_fragment:ip,clipping_planes_fragment:sp,clipping_planes_pars_fragment:rp,clipping_planes_pars_vertex:op,clipping_planes_vertex:ap,color_fragment:cp,color_pars_fragment:lp,color_pars_vertex:hp,color_vertex:up,common:fp,cube_uv_reflection_fragment:dp,defaultnormal_vertex:pp,displacementmap_pars_vertex:mp,displacementmap_vertex:gp,emissivemap_fragment:vp,emissivemap_pars_fragment:_p,colorspace_fragment:xp,colorspace_pars_fragment:yp,envmap_fragment:Mp,envmap_common_pars_fragment:Sp,envmap_pars_fragment:Ep,envmap_pars_vertex:wp,envmap_physical_pars_fragment:Up,envmap_vertex:bp,fog_vertex:Tp,fog_pars_vertex:Ap,fog_fragment:Cp,fog_pars_fragment:Rp,gradientmap_pars_fragment:Pp,lightmap_pars_fragment:Lp,lights_lambert_fragment:Ip,lights_lambert_pars_fragment:Np,lights_pars_begin:Dp,lights_toon_fragment:Fp,lights_toon_pars_fragment:zp,lights_phong_fragment:Op,lights_phong_pars_fragment:Bp,lights_physical_fragment:kp,lights_physical_pars_fragment:Vp,lights_fragment_begin:Gp,lights_fragment_maps:Hp,lights_fragment_end:Wp,logdepthbuf_fragment:qp,logdepthbuf_pars_fragment:Xp,logdepthbuf_pars_vertex:Yp,logdepthbuf_vertex:$p,map_fragment:jp,map_pars_fragment:Zp,map_particle_fragment:Kp,map_particle_pars_fragment:Jp,metalnessmap_fragment:Qp,metalnessmap_pars_fragment:t0,morphinstance_vertex:e0,morphcolor_vertex:n0,morphnormal_vertex:i0,morphtarget_pars_vertex:s0,morphtarget_vertex:r0,normal_fragment_begin:o0,normal_fragment_maps:a0,normal_pars_fragment:c0,normal_pars_vertex:l0,normal_vertex:h0,normalmap_pars_fragment:u0,clearcoat_normal_fragment_begin:f0,clearcoat_normal_fragment_maps:d0,clearcoat_pars_fragment:p0,iridescence_pars_fragment:m0,opaque_fragment:g0,packing:v0,premultiplied_alpha_fragment:_0,project_vertex:x0,dithering_fragment:y0,dithering_pars_fragment:M0,roughnessmap_fragment:S0,roughnessmap_pars_fragment:E0,shadowmap_pars_fragment:w0,shadowmap_pars_vertex:b0,shadowmap_vertex:T0,shadowmask_pars_fragment:A0,skinbase_vertex:C0,skinning_pars_vertex:R0,skinning_vertex:P0,skinnormal_vertex:L0,specularmap_fragment:I0,specularmap_pars_fragment:N0,tonemapping_fragment:D0,tonemapping_pars_fragment:U0,transmission_fragment:F0,transmission_pars_fragment:z0,uv_pars_fragment:O0,uv_pars_vertex:B0,uv_vertex:k0,worldpos_vertex:V0,background_vert:G0,background_frag:H0,backgroundCube_vert:W0,backgroundCube_frag:q0,cube_vert:X0,cube_frag:Y0,depth_vert:$0,depth_frag:j0,distanceRGBA_vert:Z0,distanceRGBA_frag:K0,equirect_vert:J0,equirect_frag:Q0,linedashed_vert:tm,linedashed_frag:em,meshbasic_vert:nm,meshbasic_frag:im,meshlambert_vert:sm,meshlambert_frag:rm,meshmatcap_vert:om,meshmatcap_frag:am,meshnormal_vert:cm,meshnormal_frag:lm,meshphong_vert:hm,meshphong_frag:um,meshphysical_vert:fm,meshphysical_frag:dm,meshtoon_vert:pm,meshtoon_frag:mm,points_vert:gm,points_frag:vm,shadow_vert:_m,shadow_frag:xm,sprite_vert:ym,sprite_frag:Mm},ft={common:{diffuse:{value:new zt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ht}},envmap:{envMap:{value:null},envMapRotation:{value:new Ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ht},normalScale:{value:new ct(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new zt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new zt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0},uvTransform:{value:new Ht}},sprite:{diffuse:{value:new zt(16777215)},opacity:{value:1},center:{value:new ct(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}}},En={basic:{uniforms:De([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:De([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,ft.lights,{emissive:{value:new zt(0)}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:De([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,ft.lights,{emissive:{value:new zt(0)},specular:{value:new zt(1118481)},shininess:{value:30}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:De([ft.common,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.roughnessmap,ft.metalnessmap,ft.fog,ft.lights,{emissive:{value:new zt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:De([ft.common,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.gradientmap,ft.fog,ft.lights,{emissive:{value:new zt(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:De([ft.common,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:De([ft.points,ft.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:De([ft.common,ft.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:De([ft.common,ft.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:De([ft.common,ft.bumpmap,ft.normalmap,ft.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:De([ft.sprite,ft.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ht}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distanceRGBA:{uniforms:De([ft.common,ft.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distanceRGBA_vert,fragmentShader:qt.distanceRGBA_frag},shadow:{uniforms:De([ft.lights,ft.fog,{color:{value:new zt(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};En.physical={uniforms:De([En.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ht},clearcoatNormalScale:{value:new ct(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ht},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ht},sheen:{value:0},sheenColor:{value:new zt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ht},transmissionSamplerSize:{value:new ct},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ht},attenuationDistance:{value:0},attenuationColor:{value:new zt(0)},specularColor:{value:new zt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ht},anisotropyVector:{value:new ct},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ht}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};const Br={r:0,b:0,g:0},xi=new rn,Sm=new Zt;function Em(s,t,e,n,i,r,o){const a=new zt(0);let c=r===!0?0:1,l,h,f=null,u=0,d=null;function m(_){let y=_.isScene===!0?_.background:null;return y&&y.isTexture&&(y=(_.backgroundBlurriness>0?e:t).get(y)),y}function v(_){let y=!1;const x=m(_);x===null?p(a,c):x&&x.isColor&&(p(x,1),y=!0);const C=s.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(_,y){const x=m(y);x&&(x.isCubeTexture||x.mapping===Ao)?(h===void 0&&(h=new ce(new Fi(1,1,1),new Ie({name:"BackgroundCubeMaterial",uniforms:Es(En.backgroundCube.uniforms),vertexShader:En.backgroundCube.vertexShader,fragmentShader:En.backgroundCube.fragmentShader,side:Ae,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,w,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),xi.copy(y.backgroundRotation),xi.x*=-1,xi.y*=-1,xi.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(xi.y*=-1,xi.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Sm.makeRotationFromEuler(xi)),h.material.toneMapped=jt.getTransfer(x.colorSpace)!==ne,(f!==x||u!==x.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,f=x,u=x.version,d=s.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new ce(new Ns(2,2),new Ie({name:"BackgroundMaterial",uniforms:Es(En.background.uniforms),vertexShader:En.background.vertexShader,fragmentShader:En.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=jt.getTransfer(x.colorSpace)!==ne,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(f!==x||u!==x.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,f=x,u=x.version,d=s.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function p(_,y){_.getRGB(Br,Fu(s)),n.buffers.color.setClear(Br.r,Br.g,Br.b,y,o)}return{getClearColor:function(){return a},setClearColor:function(_,y=1){a.set(_),c=y,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(_){c=_,p(a,c)},render:v,addToRenderList:g}}function wm(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=u(null);let r=i,o=!1;function a(M,P,O,I,F){let z=!1;const D=f(I,O,P);r!==D&&(r=D,l(r.object)),z=d(M,I,O,F),z&&m(M,I,O,F),F!==null&&t.update(F,s.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,x(M,P,O,I),F!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(F).buffer))}function c(){return s.createVertexArray()}function l(M){return s.bindVertexArray(M)}function h(M){return s.deleteVertexArray(M)}function f(M,P,O){const I=O.wireframe===!0;let F=n[M.id];F===void 0&&(F={},n[M.id]=F);let z=F[P.id];z===void 0&&(z={},F[P.id]=z);let D=z[I];return D===void 0&&(D=u(c()),z[I]=D),D}function u(M){const P=[],O=[],I=[];for(let F=0;F<e;F++)P[F]=0,O[F]=0,I[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:I,object:M,attributes:{},index:null}}function d(M,P,O,I){const F=r.attributes,z=P.attributes;let D=0;const Y=O.getAttributes();for(const G in Y)if(Y[G].location>=0){const tt=F[G];let st=z[G];if(st===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(st=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(st=M.instanceColor)),tt===void 0||tt.attribute!==st||st&&tt.data!==st.data)return!0;D++}return r.attributesNum!==D||r.index!==I}function m(M,P,O,I){const F={},z=P.attributes;let D=0;const Y=O.getAttributes();for(const G in Y)if(Y[G].location>=0){let tt=z[G];tt===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(tt=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(tt=M.instanceColor));const st={};st.attribute=tt,tt&&tt.data&&(st.data=tt.data),F[G]=st,D++}r.attributes=F,r.attributesNum=D,r.index=I}function v(){const M=r.newAttributes;for(let P=0,O=M.length;P<O;P++)M[P]=0}function g(M){p(M,0)}function p(M,P){const O=r.newAttributes,I=r.enabledAttributes,F=r.attributeDivisors;O[M]=1,I[M]===0&&(s.enableVertexAttribArray(M),I[M]=1),F[M]!==P&&(s.vertexAttribDivisor(M,P),F[M]=P)}function _(){const M=r.newAttributes,P=r.enabledAttributes;for(let O=0,I=P.length;O<I;O++)P[O]!==M[O]&&(s.disableVertexAttribArray(O),P[O]=0)}function y(M,P,O,I,F,z,D){D===!0?s.vertexAttribIPointer(M,P,O,F,z):s.vertexAttribPointer(M,P,O,I,F,z)}function x(M,P,O,I){v();const F=I.attributes,z=O.getAttributes(),D=P.defaultAttributeValues;for(const Y in z){const G=z[Y];if(G.location>=0){let X=F[Y];if(X===void 0&&(Y==="instanceMatrix"&&M.instanceMatrix&&(X=M.instanceMatrix),Y==="instanceColor"&&M.instanceColor&&(X=M.instanceColor)),X!==void 0){const tt=X.normalized,st=X.itemSize,J=t.get(X);if(J===void 0)continue;const Nt=J.buffer,$=J.type,nt=J.bytesPerElement,dt=$===s.INT||$===s.UNSIGNED_INT||X.gpuType===Ic;if(X.isInterleavedBufferAttribute){const ot=X.data,It=ot.stride,Ot=X.offset;if(ot.isInstancedInterleavedBuffer){for(let Dt=0;Dt<G.locationSize;Dt++)p(G.location+Dt,ot.meshPerAttribute);M.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let Dt=0;Dt<G.locationSize;Dt++)g(G.location+Dt);s.bindBuffer(s.ARRAY_BUFFER,Nt);for(let Dt=0;Dt<G.locationSize;Dt++)y(G.location+Dt,st/G.locationSize,$,tt,It*nt,(Ot+st/G.locationSize*Dt)*nt,dt)}else{if(X.isInstancedBufferAttribute){for(let ot=0;ot<G.locationSize;ot++)p(G.location+ot,X.meshPerAttribute);M.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let ot=0;ot<G.locationSize;ot++)g(G.location+ot);s.bindBuffer(s.ARRAY_BUFFER,Nt);for(let ot=0;ot<G.locationSize;ot++)y(G.location+ot,st/G.locationSize,$,tt,st*nt,st/G.locationSize*ot*nt,dt)}}else if(D!==void 0){const tt=D[Y];if(tt!==void 0)switch(tt.length){case 2:s.vertexAttrib2fv(G.location,tt);break;case 3:s.vertexAttrib3fv(G.location,tt);break;case 4:s.vertexAttrib4fv(G.location,tt);break;default:s.vertexAttrib1fv(G.location,tt)}}}}_()}function C(){R();for(const M in n){const P=n[M];for(const O in P){const I=P[O];for(const F in I)h(I[F].object),delete I[F];delete P[O]}delete n[M]}}function w(M){if(n[M.id]===void 0)return;const P=n[M.id];for(const O in P){const I=P[O];for(const F in I)h(I[F].object),delete I[F];delete P[O]}delete n[M.id]}function T(M){for(const P in n){const O=n[P];if(O[M.id]===void 0)continue;const I=O[M.id];for(const F in I)h(I[F].object),delete I[F];delete O[M.id]}}function R(){S(),o=!0,r!==i&&(r=i,l(r.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:R,resetDefaultState:S,dispose:C,releaseStatesOfGeometry:w,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:g,disableUnusedAttributes:_}}function bm(s,t,e){let n;function i(l){n=l}function r(l,h){s.drawArrays(n,l,h),e.update(h,n,1)}function o(l,h,f){f!==0&&(s.drawArraysInstanced(n,l,h,f),e.update(h,n,f))}function a(l,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,f);let d=0;for(let m=0;m<f;m++)d+=h[m];e.update(d,n,1)}function c(l,h,f,u){if(f===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let m=0;m<l.length;m++)o(l[m],h[m],u[m]);else{d.multiDrawArraysInstancedWEBGL(n,l,0,h,0,u,0,f);let m=0;for(let v=0;v<f;v++)m+=h[v]*u[v];e.update(m,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Tm(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const T=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(T){return!(T!==en&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){const R=T===Rs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==An&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==bn&&!R)}function c(T){if(T==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const f=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),_=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),y=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=m>0,w=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:f,reverseDepthBuffer:u,maxTextures:d,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:_,maxVaryings:y,maxFragmentUniforms:x,vertexTextures:C,maxSamples:w}}function Am(s){const t=this;let e=null,n=0,i=!1,r=!1;const o=new Ei,a=new Ht,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){const d=f.length!==0||u||n!==0||i;return i=u,n=f.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,d){const m=f.clippingPlanes,v=f.clipIntersection,g=f.clipShadows,p=s.get(f);if(!i||m===null||m.length===0||r&&!g)r?h(null):l();else{const _=r?0:n,y=_*4;let x=p.clippingState||null;c.value=x,x=h(m,u,y,d);for(let C=0;C!==y;++C)x[C]=e[C];p.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(f,u,d,m){const v=f!==null?f.length:0;let g=null;if(v!==0){if(g=c.value,m!==!0||g===null){const p=d+v*4,_=u.matrixWorldInverse;a.getNormalMatrix(_),(g===null||g.length<p)&&(g=new Float32Array(p));for(let y=0,x=d;y!==v;++y,x+=4)o.copy(f[y]).applyMatrix4(_,a),o.normal.toArray(g,x),g[x+3]=o.constant}c.value=g,c.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,g}}function Cm(s){let t=new WeakMap;function e(o,a){return a===Ya?o.mapping=xs:a===$a&&(o.mapping=ys),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Ya||a===$a)if(t.has(o)){const c=t.get(o).texture;return e(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new Bd(c.height);return l.fromEquirectangularTexture(s,o),t.set(o,l),o.addEventListener("dispose",i),e(l.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const c=t.get(a);c!==void 0&&(t.delete(a),c.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Vu extends zu{constructor(t=-1,e=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=i+e,c=i-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const ls=4,Il=[.125,.215,.35,.446,.526,.582],Ai=20,la=new Vu,Nl=new zt;let ha=null,ua=0,fa=0,da=!1;const wi=(1+Math.sqrt(5))/2,Ji=1/wi,Dl=[new U(-wi,Ji,0),new U(wi,Ji,0),new U(-Ji,0,wi),new U(Ji,0,wi),new U(0,wi,-Ji),new U(0,wi,Ji),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)];class Ul{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){ha=this._renderer.getRenderTarget(),ua=this._renderer.getActiveCubeFace(),fa=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ol(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ha,ua,fa),this._renderer.xr.enabled=da,t.scissorTest=!1,kr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===xs||t.mapping===ys?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ha=this._renderer.getRenderTarget(),ua=this._renderer.getActiveCubeFace(),fa=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:wn,minFilter:wn,generateMipmaps:!1,type:Rs,format:en,colorSpace:Ps,depthBuffer:!1},i=Fl(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fl(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Rm(r)),this._blurMaterial=Pm(r,t,e)}return i}_compileMaterial(t){const e=new ce(this._lodPlanes[0],t);this._renderer.compile(e,la)}_sceneToCubeUV(t,e,n,i){const a=new tn(90,1,e,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,u=h.toneMapping;h.getClearColor(Nl),h.toneMapping=ui,h.autoClear=!1;const d=new Nu({name:"PMREM.Background",side:Ae,depthWrite:!1,depthTest:!1}),m=new ce(new Fi,d);let v=!1;const g=t.background;g?g.isColor&&(d.color.copy(g),t.background=null,v=!0):(d.color.copy(Nl),v=!0);for(let p=0;p<6;p++){const _=p%3;_===0?(a.up.set(0,c[p],0),a.lookAt(l[p],0,0)):_===1?(a.up.set(0,0,c[p]),a.lookAt(0,l[p],0)):(a.up.set(0,c[p],0),a.lookAt(0,0,l[p]));const y=this._cubeSize;kr(i,_*y,p>2?y:0,y,y),h.setRenderTarget(i),v&&h.render(m,a),h.render(t,a)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=u,h.autoClear=f,t.background=g}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===xs||t.mapping===ys;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ol()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zl());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new ce(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const c=this._cubeSize;kr(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,la)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Dl[(i-r-1)%Dl.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",r),this._halfBlur(o,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,f=new ce(this._lodPlanes[i],l),u=l.uniforms,d=this._sizeLods[n]-1,m=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Ai-1),v=r/m,g=isFinite(r)?1+Math.floor(h*v):Ai;g>Ai&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Ai}`);const p=[];let _=0;for(let T=0;T<Ai;++T){const R=T/v,S=Math.exp(-R*R/2);p.push(S),T===0?_+=S:T<g&&(_+=2*S)}for(let T=0;T<p.length;T++)p[T]=p[T]/_;u.envMap.value=t.texture,u.samples.value=g,u.weights.value=p,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:y}=this;u.dTheta.value=m,u.mipInt.value=y-n;const x=this._sizeLods[i],C=3*x*(i>y-ls?i-y+ls:0),w=4*(this._cubeSize-x);kr(e,C,w,3*x,2*x),c.setRenderTarget(e),c.render(f,la)}}function Rm(s){const t=[],e=[],n=[];let i=s;const r=s-ls+1+Il.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);e.push(a);let c=1/a;o>s-ls?c=Il[o-s+ls-1]:o===0&&(c=0),n.push(c);const l=1/(a-2),h=-l,f=1+l,u=[h,h,f,h,f,f,h,h,f,f,h,f],d=6,m=6,v=3,g=2,p=1,_=new Float32Array(v*m*d),y=new Float32Array(g*m*d),x=new Float32Array(p*m*d);for(let w=0;w<d;w++){const T=w%3*2/3-1,R=w>2?0:-1,S=[T,R,0,T+2/3,R,0,T+2/3,R+1,0,T,R,0,T+2/3,R+1,0,T,R+1,0];_.set(S,v*m*w),y.set(u,g*m*w);const M=[w,w,w,w,w,w];x.set(M,p*m*w)}const C=new be;C.setAttribute("position",new xe(_,v)),C.setAttribute("uv",new xe(y,g)),C.setAttribute("faceIndex",new xe(x,p)),t.push(C),i>ls&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Fl(s,t,e){const n=new $n(s,t,e);return n.texture.mapping=Ao,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function kr(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function Pm(s,t,e){const n=new Float32Array(Ai),i=new U(0,1,0);return new Ie({name:"SphericalGaussianBlur",defines:{n:Ai,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Bc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function zl(){return new Ie({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Bc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Ol(){return new Ie({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Bc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Bc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Lm(s){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const c=a.mapping,l=c===Ya||c===$a,h=c===xs||c===ys;if(l||h){let f=t.get(a);const u=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return e===null&&(e=new Ul(s)),f=l?e.fromEquirectangular(a,f):e.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),f.texture;if(f!==void 0)return f.texture;{const d=a.image;return l&&d&&d.height>0||h&&d&&i(d)?(e===null&&(e=new Ul(s)),f=l?e.fromEquirectangular(a):e.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function i(a){let c=0;const l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){const c=a.target;c.removeEventListener("dispose",r);const l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Im(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&tr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Nm(s,t,e,n){const i={},r=new WeakMap;function o(f){const u=f.target;u.index!==null&&t.remove(u.index);for(const m in u.attributes)t.remove(u.attributes[m]);for(const m in u.morphAttributes){const v=u.morphAttributes[m];for(let g=0,p=v.length;g<p;g++)t.remove(v[g])}u.removeEventListener("dispose",o),delete i[u.id];const d=r.get(u);d&&(t.remove(d),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(f,u){return i[u.id]===!0||(u.addEventListener("dispose",o),i[u.id]=!0,e.memory.geometries++),u}function c(f){const u=f.attributes;for(const m in u)t.update(u[m],s.ARRAY_BUFFER);const d=f.morphAttributes;for(const m in d){const v=d[m];for(let g=0,p=v.length;g<p;g++)t.update(v[g],s.ARRAY_BUFFER)}}function l(f){const u=[],d=f.index,m=f.attributes.position;let v=0;if(d!==null){const _=d.array;v=d.version;for(let y=0,x=_.length;y<x;y+=3){const C=_[y+0],w=_[y+1],T=_[y+2];u.push(C,w,w,T,T,C)}}else if(m!==void 0){const _=m.array;v=m.version;for(let y=0,x=_.length/3-1;y<x;y+=3){const C=y+0,w=y+1,T=y+2;u.push(C,w,w,T,T,C)}}else return;const g=new(Cu(u)?Uu:Du)(u,1);g.version=v;const p=r.get(f);p&&t.remove(p),r.set(f,g)}function h(f){const u=r.get(f);if(u){const d=f.index;d!==null&&u.version<d.version&&l(f)}else l(f);return r.get(f)}return{get:a,update:c,getWireframeAttribute:h}}function Dm(s,t,e){let n;function i(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function c(u,d){s.drawElements(n,d,r,u*o),e.update(d,n,1)}function l(u,d,m){m!==0&&(s.drawElementsInstanced(n,d,r,u*o,m),e.update(d,n,m))}function h(u,d,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,m);let g=0;for(let p=0;p<m;p++)g+=d[p];e.update(g,n,1)}function f(u,d,m,v){if(m===0)return;const g=t.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<u.length;p++)l(u[p]/o,d[p],v[p]);else{g.multiDrawElementsInstancedWEBGL(n,d,0,r,u,0,v,0,m);let p=0;for(let _=0;_<m;_++)p+=d[_]*v[_];e.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function Um(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function Fm(s,t,e){const n=new WeakMap,i=new de;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=h!==void 0?h.length:0;let u=n.get(a);if(u===void 0||u.count!==f){let M=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",M)};var d=M;u!==void 0&&u.texture.dispose();const m=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,g=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],_=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let x=0;m===!0&&(x=1),v===!0&&(x=2),g===!0&&(x=3);let C=a.attributes.position.count*x,w=1;C>t.maxTextureSize&&(w=Math.ceil(C/t.maxTextureSize),C=t.maxTextureSize);const T=new Float32Array(C*w*4*f),R=new Pu(T,C,w,f);R.type=bn,R.needsUpdate=!0;const S=x*4;for(let P=0;P<f;P++){const O=p[P],I=_[P],F=y[P],z=C*w*4*P;for(let D=0;D<O.count;D++){const Y=D*S;m===!0&&(i.fromBufferAttribute(O,D),T[z+Y+0]=i.x,T[z+Y+1]=i.y,T[z+Y+2]=i.z,T[z+Y+3]=0),v===!0&&(i.fromBufferAttribute(I,D),T[z+Y+4]=i.x,T[z+Y+5]=i.y,T[z+Y+6]=i.z,T[z+Y+7]=0),g===!0&&(i.fromBufferAttribute(F,D),T[z+Y+8]=i.x,T[z+Y+9]=i.y,T[z+Y+10]=i.z,T[z+Y+11]=F.itemSize===4?i.w:1)}}u={count:f,texture:R,size:new ct(C,w)},n.set(a,u),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let m=0;for(let g=0;g<l.length;g++)m+=l[g];const v=a.morphTargetsRelative?1:1-m;c.getUniforms().setValue(s,"morphTargetBaseInfluence",v),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),c.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function zm(s,t,e,n){let i=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,f=t.get(c,h);if(i.get(f)!==l&&(t.update(f),i.set(f,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==l&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const u=c.skeleton;i.get(u)!==l&&(u.update(),i.set(u,l))}return f}function o(){i=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:r,dispose:o}}class Gu extends ze{constructor(t,e,n,i,r,o,a,c,l,h=ds){if(h!==ds&&h!==Ss)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===ds&&(n=Di),n===void 0&&h===Ss&&(n=Ms),super(null,i,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:$e,this.minFilter=c!==void 0?c:$e,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Hu=new ze,Bl=new Gu(1,1),Wu=new Pu,qu=new wd,Xu=new Ou,kl=[],Vl=[],Gl=new Float32Array(16),Hl=new Float32Array(9),Wl=new Float32Array(4);function Ds(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=kl[i];if(r===void 0&&(r=new Float32Array(i),kl[i]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Se(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Ee(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Io(s,t){let e=Vl[t];e===void 0&&(e=new Int32Array(t),Vl[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function Om(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function Bm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Se(e,t))return;s.uniform2fv(this.addr,t),Ee(e,t)}}function km(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Se(e,t))return;s.uniform3fv(this.addr,t),Ee(e,t)}}function Vm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Se(e,t))return;s.uniform4fv(this.addr,t),Ee(e,t)}}function Gm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Se(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Ee(e,t)}else{if(Se(e,n))return;Wl.set(n),s.uniformMatrix2fv(this.addr,!1,Wl),Ee(e,n)}}function Hm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Se(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Ee(e,t)}else{if(Se(e,n))return;Hl.set(n),s.uniformMatrix3fv(this.addr,!1,Hl),Ee(e,n)}}function Wm(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Se(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Ee(e,t)}else{if(Se(e,n))return;Gl.set(n),s.uniformMatrix4fv(this.addr,!1,Gl),Ee(e,n)}}function qm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function Xm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Se(e,t))return;s.uniform2iv(this.addr,t),Ee(e,t)}}function Ym(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Se(e,t))return;s.uniform3iv(this.addr,t),Ee(e,t)}}function $m(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Se(e,t))return;s.uniform4iv(this.addr,t),Ee(e,t)}}function jm(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function Zm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Se(e,t))return;s.uniform2uiv(this.addr,t),Ee(e,t)}}function Km(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Se(e,t))return;s.uniform3uiv(this.addr,t),Ee(e,t)}}function Jm(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Se(e,t))return;s.uniform4uiv(this.addr,t),Ee(e,t)}}function Qm(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Bl.compareFunction=Au,r=Bl):r=Hu,e.setTexture2D(t||r,i)}function tg(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||qu,i)}function eg(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Xu,i)}function ng(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Wu,i)}function ig(s){switch(s){case 5126:return Om;case 35664:return Bm;case 35665:return km;case 35666:return Vm;case 35674:return Gm;case 35675:return Hm;case 35676:return Wm;case 5124:case 35670:return qm;case 35667:case 35671:return Xm;case 35668:case 35672:return Ym;case 35669:case 35673:return $m;case 5125:return jm;case 36294:return Zm;case 36295:return Km;case 36296:return Jm;case 35678:case 36198:case 36298:case 36306:case 35682:return Qm;case 35679:case 36299:case 36307:return tg;case 35680:case 36300:case 36308:case 36293:return eg;case 36289:case 36303:case 36311:case 36292:return ng}}function sg(s,t){s.uniform1fv(this.addr,t)}function rg(s,t){const e=Ds(t,this.size,2);s.uniform2fv(this.addr,e)}function og(s,t){const e=Ds(t,this.size,3);s.uniform3fv(this.addr,e)}function ag(s,t){const e=Ds(t,this.size,4);s.uniform4fv(this.addr,e)}function cg(s,t){const e=Ds(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function lg(s,t){const e=Ds(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function hg(s,t){const e=Ds(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function ug(s,t){s.uniform1iv(this.addr,t)}function fg(s,t){s.uniform2iv(this.addr,t)}function dg(s,t){s.uniform3iv(this.addr,t)}function pg(s,t){s.uniform4iv(this.addr,t)}function mg(s,t){s.uniform1uiv(this.addr,t)}function gg(s,t){s.uniform2uiv(this.addr,t)}function vg(s,t){s.uniform3uiv(this.addr,t)}function _g(s,t){s.uniform4uiv(this.addr,t)}function xg(s,t,e){const n=this.cache,i=t.length,r=Io(e,i);Se(n,r)||(s.uniform1iv(this.addr,r),Ee(n,r));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||Hu,r[o])}function yg(s,t,e){const n=this.cache,i=t.length,r=Io(e,i);Se(n,r)||(s.uniform1iv(this.addr,r),Ee(n,r));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||qu,r[o])}function Mg(s,t,e){const n=this.cache,i=t.length,r=Io(e,i);Se(n,r)||(s.uniform1iv(this.addr,r),Ee(n,r));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||Xu,r[o])}function Sg(s,t,e){const n=this.cache,i=t.length,r=Io(e,i);Se(n,r)||(s.uniform1iv(this.addr,r),Ee(n,r));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||Wu,r[o])}function Eg(s){switch(s){case 5126:return sg;case 35664:return rg;case 35665:return og;case 35666:return ag;case 35674:return cg;case 35675:return lg;case 35676:return hg;case 5124:case 35670:return ug;case 35667:case 35671:return fg;case 35668:case 35672:return dg;case 35669:case 35673:return pg;case 5125:return mg;case 36294:return gg;case 36295:return vg;case 36296:return _g;case 35678:case 36198:case 36298:case 36306:case 35682:return xg;case 35679:case 36299:case 36307:return yg;case 35680:case 36300:case 36308:case 36293:return Mg;case 36289:case 36303:case 36311:case 36292:return Sg}}class wg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=ig(e.type)}}class bg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Eg(e.type)}}class Tg{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(t,e[a.id],n)}}}const pa=/(\w+)(\])?(\[|\.)?/g;function ql(s,t){s.seq.push(t),s.map[t.id]=t}function Ag(s,t,e){const n=s.name,i=n.length;for(pa.lastIndex=0;;){const r=pa.exec(n),o=pa.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){ql(e,l===void 0?new wg(a,s,t):new bg(a,s,t));break}else{let f=e.map[a];f===void 0&&(f=new Tg(a),ql(e,f)),e=f}}}class vo{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),o=t.getUniformLocation(e,r.name);Ag(r,o,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,o=e.length;r!==o;++r){const a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const o=t[i];o.id in e&&n.push(o)}return n}}function Xl(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const Cg=37297;let Rg=0;function Pg(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const Yl=new Ht;function Lg(s){jt._getMatrix(Yl,jt.workingColorSpace,s);const t=`mat3( ${Yl.elements.map(e=>e.toFixed(4))} )`;switch(jt.getTransfer(s)){case Co:return[t,"LinearTransferOETF"];case ne:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function $l(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+Pg(s.getShaderSource(t),o)}else return i}function Ig(s,t){const e=Lg(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Ng(s,t){let e;switch(t){case jf:e="Linear";break;case Zf:e="Reinhard";break;case Kf:e="Cineon";break;case Jf:e="ACESFilmic";break;case td:e="AgX";break;case ed:e="Neutral";break;case Qf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Vr=new U;function Dg(){jt.getLuminanceCoefficients(Vr);const s=Vr.x.toFixed(4),t=Vr.y.toFixed(4),e=Vr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ug(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(er).join(`
`)}function Fg(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function zg(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function er(s){return s!==""}function jl(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Zl(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Og=/^[ \t]*#include +<([\w\d./]+)>/gm;function wc(s){return s.replace(Og,kg)}const Bg=new Map;function kg(s,t){let e=qt[t];if(e===void 0){const n=Bg.get(t);if(n!==void 0)e=qt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return wc(e)}const Vg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Kl(s){return s.replace(Vg,Gg)}function Gg(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Jl(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Hg(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===du?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Pf?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Hn&&(t="SHADOWMAP_TYPE_VSM"),t}function Wg(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case xs:case ys:t="ENVMAP_TYPE_CUBE";break;case Ao:t="ENVMAP_TYPE_CUBE_UV";break}return t}function qg(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case ys:t="ENVMAP_MODE_REFRACTION";break}return t}function Xg(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case mu:t="ENVMAP_BLENDING_MULTIPLY";break;case Yf:t="ENVMAP_BLENDING_MIX";break;case $f:t="ENVMAP_BLENDING_ADD";break}return t}function Yg(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function $g(s,t,e,n){const i=s.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const c=Hg(e),l=Wg(e),h=qg(e),f=Xg(e),u=Yg(e),d=Ug(e),m=Fg(r),v=i.createProgram();let g,p,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(er).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(er).join(`
`),p.length>0&&(p+=`
`)):(g=[Jl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(er).join(`
`),p=[Jl(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ui?"#define TONE_MAPPING":"",e.toneMapping!==ui?qt.tonemapping_pars_fragment:"",e.toneMapping!==ui?Ng("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,Ig("linearToOutputTexel",e.outputColorSpace),Dg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(er).join(`
`)),o=wc(o),o=jl(o,e),o=Zl(o,e),a=wc(a),a=jl(a,e),a=Zl(a,e),o=Kl(o),a=Kl(a),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",e.glslVersion===ul?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===ul?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=_+g+o,x=_+p+a,C=Xl(i,i.VERTEX_SHADER,y),w=Xl(i,i.FRAGMENT_SHADER,x);i.attachShader(v,C),i.attachShader(v,w),e.index0AttributeName!==void 0?i.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function T(P){if(s.debug.checkShaderErrors){const O=i.getProgramInfoLog(v).trim(),I=i.getShaderInfoLog(C).trim(),F=i.getShaderInfoLog(w).trim();let z=!0,D=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(z=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,C,w);else{const Y=$l(i,C,"vertex"),G=$l(i,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+O+`
`+Y+`
`+G)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(I===""||F==="")&&(D=!1);D&&(P.diagnostics={runnable:z,programLog:O,vertexShader:{log:I,prefix:g},fragmentShader:{log:F,prefix:p}})}i.deleteShader(C),i.deleteShader(w),R=new vo(i,v),S=zg(i,v)}let R;this.getUniforms=function(){return R===void 0&&T(this),R};let S;this.getAttributes=function(){return S===void 0&&T(this),S};let M=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=i.getProgramParameter(v,Cg)),M},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Rg++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=C,this.fragmentShader=w,this}let jg=0;class Zg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Kg(t),e.set(t,n)),n}}class Kg{constructor(t){this.id=jg++,this.code=t,this.usedTimes=0}}function Jg(s,t,e,n,i,r,o){const a=new Oc,c=new Zg,l=new Set,h=[],f=i.logarithmicDepthBuffer,u=i.vertexTextures;let d=i.precision;const m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(S){return l.add(S),S===0?"uv":`uv${S}`}function g(S,M,P,O,I){const F=O.fog,z=I.geometry,D=S.isMeshStandardMaterial?O.environment:null,Y=(S.isMeshStandardMaterial?e:t).get(S.envMap||D),G=Y&&Y.mapping===Ao?Y.image.height:null,X=m[S.type];S.precision!==null&&(d=i.getMaxPrecision(S.precision),d!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",d,"instead."));const tt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,st=tt!==void 0?tt.length:0;let J=0;z.morphAttributes.position!==void 0&&(J=1),z.morphAttributes.normal!==void 0&&(J=2),z.morphAttributes.color!==void 0&&(J=3);let Nt,$,nt,dt;if(X){const ee=En[X];Nt=ee.vertexShader,$=ee.fragmentShader}else Nt=S.vertexShader,$=S.fragmentShader,c.update(S),nt=c.getVertexShaderID(S),dt=c.getFragmentShaderID(S);const ot=s.getRenderTarget(),It=s.state.buffers.depth.getReversed(),Ot=I.isInstancedMesh===!0,Dt=I.isBatchedMesh===!0,Xt=!!S.map,et=!!S.matcap,lt=!!Y,N=!!S.aoMap,Pt=!!S.lightMap,rt=!!S.bumpMap,St=!!S.normalMap,ut=!!S.displacementMap,Ut=!!S.emissiveMap,yt=!!S.metalnessMap,L=!!S.roughnessMap,b=S.anisotropy>0,H=S.clearcoat>0,Z=S.dispersion>0,it=S.iridescence>0,K=S.sheen>0,Tt=S.transmission>0,pt=b&&!!S.anisotropyMap,Mt=H&&!!S.clearcoatMap,Yt=H&&!!S.clearcoatNormalMap,at=H&&!!S.clearcoatRoughnessMap,wt=it&&!!S.iridescenceMap,Ft=it&&!!S.iridescenceThicknessMap,Bt=K&&!!S.sheenColorMap,bt=K&&!!S.sheenRoughnessMap,$t=!!S.specularMap,Wt=!!S.specularColorMap,ie=!!S.specularIntensityMap,B=Tt&&!!S.transmissionMap,mt=Tt&&!!S.thicknessMap,j=!!S.gradientMap,Q=!!S.alphaMap,_t=S.alphaTest>0,gt=!!S.alphaHash,Vt=!!S.extensions;let ue=ui;S.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(ue=s.toneMapping);const Ce={shaderID:X,shaderType:S.type,shaderName:S.name,vertexShader:Nt,fragmentShader:$,defines:S.defines,customVertexShaderID:nt,customFragmentShaderID:dt,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:d,batching:Dt,batchingColor:Dt&&I._colorsTexture!==null,instancing:Ot,instancingColor:Ot&&I.instanceColor!==null,instancingMorph:Ot&&I.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:ot===null?s.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:Ps,alphaToCoverage:!!S.alphaToCoverage,map:Xt,matcap:et,envMap:lt,envMapMode:lt&&Y.mapping,envMapCubeUVHeight:G,aoMap:N,lightMap:Pt,bumpMap:rt,normalMap:St,displacementMap:u&&ut,emissiveMap:Ut,normalMapObjectSpace:St&&S.normalMapType===od,normalMapTangentSpace:St&&S.normalMapType===rd,metalnessMap:yt,roughnessMap:L,anisotropy:b,anisotropyMap:pt,clearcoat:H,clearcoatMap:Mt,clearcoatNormalMap:Yt,clearcoatRoughnessMap:at,dispersion:Z,iridescence:it,iridescenceMap:wt,iridescenceThicknessMap:Ft,sheen:K,sheenColorMap:Bt,sheenRoughnessMap:bt,specularMap:$t,specularColorMap:Wt,specularIntensityMap:ie,transmission:Tt,transmissionMap:B,thicknessMap:mt,gradientMap:j,opaque:S.transparent===!1&&S.blending===fs&&S.alphaToCoverage===!1,alphaMap:Q,alphaTest:_t,alphaHash:gt,combine:S.combine,mapUv:Xt&&v(S.map.channel),aoMapUv:N&&v(S.aoMap.channel),lightMapUv:Pt&&v(S.lightMap.channel),bumpMapUv:rt&&v(S.bumpMap.channel),normalMapUv:St&&v(S.normalMap.channel),displacementMapUv:ut&&v(S.displacementMap.channel),emissiveMapUv:Ut&&v(S.emissiveMap.channel),metalnessMapUv:yt&&v(S.metalnessMap.channel),roughnessMapUv:L&&v(S.roughnessMap.channel),anisotropyMapUv:pt&&v(S.anisotropyMap.channel),clearcoatMapUv:Mt&&v(S.clearcoatMap.channel),clearcoatNormalMapUv:Yt&&v(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:at&&v(S.clearcoatRoughnessMap.channel),iridescenceMapUv:wt&&v(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ft&&v(S.iridescenceThicknessMap.channel),sheenColorMapUv:Bt&&v(S.sheenColorMap.channel),sheenRoughnessMapUv:bt&&v(S.sheenRoughnessMap.channel),specularMapUv:$t&&v(S.specularMap.channel),specularColorMapUv:Wt&&v(S.specularColorMap.channel),specularIntensityMapUv:ie&&v(S.specularIntensityMap.channel),transmissionMapUv:B&&v(S.transmissionMap.channel),thicknessMapUv:mt&&v(S.thicknessMap.channel),alphaMapUv:Q&&v(S.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(St||b),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!z.attributes.uv&&(Xt||Q),fog:!!F,useFog:S.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:It,skinning:I.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:J,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:ue,decodeVideoTexture:Xt&&S.map.isVideoTexture===!0&&jt.getTransfer(S.map.colorSpace)===ne,decodeVideoTextureEmissive:Ut&&S.emissiveMap.isVideoTexture===!0&&jt.getTransfer(S.emissiveMap.colorSpace)===ne,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===pn,flipSided:S.side===Ae,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Vt&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Vt&&S.extensions.multiDraw===!0||Dt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Ce.vertexUv1s=l.has(1),Ce.vertexUv2s=l.has(2),Ce.vertexUv3s=l.has(3),l.clear(),Ce}function p(S){const M=[];if(S.shaderID?M.push(S.shaderID):(M.push(S.customVertexShaderID),M.push(S.customFragmentShaderID)),S.defines!==void 0)for(const P in S.defines)M.push(P),M.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(_(M,S),y(M,S),M.push(s.outputColorSpace)),M.push(S.customProgramCacheKey),M.join()}function _(S,M){S.push(M.precision),S.push(M.outputColorSpace),S.push(M.envMapMode),S.push(M.envMapCubeUVHeight),S.push(M.mapUv),S.push(M.alphaMapUv),S.push(M.lightMapUv),S.push(M.aoMapUv),S.push(M.bumpMapUv),S.push(M.normalMapUv),S.push(M.displacementMapUv),S.push(M.emissiveMapUv),S.push(M.metalnessMapUv),S.push(M.roughnessMapUv),S.push(M.anisotropyMapUv),S.push(M.clearcoatMapUv),S.push(M.clearcoatNormalMapUv),S.push(M.clearcoatRoughnessMapUv),S.push(M.iridescenceMapUv),S.push(M.iridescenceThicknessMapUv),S.push(M.sheenColorMapUv),S.push(M.sheenRoughnessMapUv),S.push(M.specularMapUv),S.push(M.specularColorMapUv),S.push(M.specularIntensityMapUv),S.push(M.transmissionMapUv),S.push(M.thicknessMapUv),S.push(M.combine),S.push(M.fogExp2),S.push(M.sizeAttenuation),S.push(M.morphTargetsCount),S.push(M.morphAttributeCount),S.push(M.numDirLights),S.push(M.numPointLights),S.push(M.numSpotLights),S.push(M.numSpotLightMaps),S.push(M.numHemiLights),S.push(M.numRectAreaLights),S.push(M.numDirLightShadows),S.push(M.numPointLightShadows),S.push(M.numSpotLightShadows),S.push(M.numSpotLightShadowsWithMaps),S.push(M.numLightProbes),S.push(M.shadowMapType),S.push(M.toneMapping),S.push(M.numClippingPlanes),S.push(M.numClipIntersection),S.push(M.depthPacking)}function y(S,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reverseDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),S.push(a.mask)}function x(S){const M=m[S.type];let P;if(M){const O=En[M];P=Lo.clone(O.uniforms)}else P=S.uniforms;return P}function C(S,M){let P;for(let O=0,I=h.length;O<I;O++){const F=h[O];if(F.cacheKey===M){P=F,++P.usedTimes;break}}return P===void 0&&(P=new $g(s,M,S,r),h.push(P)),P}function w(S){if(--S.usedTimes===0){const M=h.indexOf(S);h[M]=h[h.length-1],h.pop(),S.destroy()}}function T(S){c.remove(S)}function R(){c.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:x,acquireProgram:C,releaseProgram:w,releaseShaderCache:T,programs:h,dispose:R}}function Qg(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,c){s.get(o)[a]=c}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function tv(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function Ql(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function th(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function o(f,u,d,m,v,g){let p=s[t];return p===void 0?(p={id:f.id,object:f,geometry:u,material:d,groupOrder:m,renderOrder:f.renderOrder,z:v,group:g},s[t]=p):(p.id=f.id,p.object=f,p.geometry=u,p.material=d,p.groupOrder=m,p.renderOrder=f.renderOrder,p.z=v,p.group=g),t++,p}function a(f,u,d,m,v,g){const p=o(f,u,d,m,v,g);d.transmission>0?n.push(p):d.transparent===!0?i.push(p):e.push(p)}function c(f,u,d,m,v,g){const p=o(f,u,d,m,v,g);d.transmission>0?n.unshift(p):d.transparent===!0?i.unshift(p):e.unshift(p)}function l(f,u){e.length>1&&e.sort(f||tv),n.length>1&&n.sort(u||Ql),i.length>1&&i.sort(u||Ql)}function h(){for(let f=t,u=s.length;f<u;f++){const d=s[f];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:a,unshift:c,finish:h,sort:l}}function ev(){let s=new WeakMap;function t(n,i){const r=s.get(n);let o;return r===void 0?(o=new th,s.set(n,[o])):i>=r.length?(o=new th,r.push(o)):o=r[i],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function nv(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new U,color:new zt};break;case"SpotLight":e={position:new U,direction:new U,color:new zt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new zt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new zt,groundColor:new zt};break;case"RectAreaLight":e={color:new zt,position:new U,halfWidth:new U,halfHeight:new U};break}return s[t.id]=e,e}}}function iv(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let sv=0;function rv(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function ov(s){const t=new nv,e=iv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new U);const i=new U,r=new Zt,o=new Zt;function a(l){let h=0,f=0,u=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let d=0,m=0,v=0,g=0,p=0,_=0,y=0,x=0,C=0,w=0,T=0;l.sort(rv);for(let S=0,M=l.length;S<M;S++){const P=l[S],O=P.color,I=P.intensity,F=P.distance,z=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=O.r*I,f+=O.g*I,u+=O.b*I;else if(P.isLightProbe){for(let D=0;D<9;D++)n.probe[D].addScaledVector(P.sh.coefficients[D],I);T++}else if(P.isDirectionalLight){const D=t.get(P);if(D.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const Y=P.shadow,G=e.get(P);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,n.directionalShadow[d]=G,n.directionalShadowMap[d]=z,n.directionalShadowMatrix[d]=P.shadow.matrix,_++}n.directional[d]=D,d++}else if(P.isSpotLight){const D=t.get(P);D.position.setFromMatrixPosition(P.matrixWorld),D.color.copy(O).multiplyScalar(I),D.distance=F,D.coneCos=Math.cos(P.angle),D.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),D.decay=P.decay,n.spot[v]=D;const Y=P.shadow;if(P.map&&(n.spotLightMap[C]=P.map,C++,Y.updateMatrices(P),P.castShadow&&w++),n.spotLightMatrix[v]=Y.matrix,P.castShadow){const G=e.get(P);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=z,x++}v++}else if(P.isRectAreaLight){const D=t.get(P);D.color.copy(O).multiplyScalar(I),D.halfWidth.set(P.width*.5,0,0),D.halfHeight.set(0,P.height*.5,0),n.rectArea[g]=D,g++}else if(P.isPointLight){const D=t.get(P);if(D.color.copy(P.color).multiplyScalar(P.intensity),D.distance=P.distance,D.decay=P.decay,P.castShadow){const Y=P.shadow,G=e.get(P);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,G.shadowCameraNear=Y.camera.near,G.shadowCameraFar=Y.camera.far,n.pointShadow[m]=G,n.pointShadowMap[m]=z,n.pointShadowMatrix[m]=P.shadow.matrix,y++}n.point[m]=D,m++}else if(P.isHemisphereLight){const D=t.get(P);D.skyColor.copy(P.color).multiplyScalar(I),D.groundColor.copy(P.groundColor).multiplyScalar(I),n.hemi[p]=D,p++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ft.LTC_FLOAT_1,n.rectAreaLTC2=ft.LTC_FLOAT_2):(n.rectAreaLTC1=ft.LTC_HALF_1,n.rectAreaLTC2=ft.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=u;const R=n.hash;(R.directionalLength!==d||R.pointLength!==m||R.spotLength!==v||R.rectAreaLength!==g||R.hemiLength!==p||R.numDirectionalShadows!==_||R.numPointShadows!==y||R.numSpotShadows!==x||R.numSpotMaps!==C||R.numLightProbes!==T)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=g,n.point.length=m,n.hemi.length=p,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=x+C-w,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=T,R.directionalLength=d,R.pointLength=m,R.spotLength=v,R.rectAreaLength=g,R.hemiLength=p,R.numDirectionalShadows=_,R.numPointShadows=y,R.numSpotShadows=x,R.numSpotMaps=C,R.numLightProbes=T,n.version=sv++)}function c(l,h){let f=0,u=0,d=0,m=0,v=0;const g=h.matrixWorldInverse;for(let p=0,_=l.length;p<_;p++){const y=l[p];if(y.isDirectionalLight){const x=n.directional[f];x.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(g),f++}else if(y.isSpotLight){const x=n.spot[d];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(g),x.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),x.direction.sub(i),x.direction.transformDirection(g),d++}else if(y.isRectAreaLight){const x=n.rectArea[m];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(g),o.identity(),r.copy(y.matrixWorld),r.premultiply(g),o.extractRotation(r),x.halfWidth.set(y.width*.5,0,0),x.halfHeight.set(0,y.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),m++}else if(y.isPointLight){const x=n.point[u];x.position.setFromMatrixPosition(y.matrixWorld),x.position.applyMatrix4(g),u++}else if(y.isHemisphereLight){const x=n.hemi[v];x.direction.setFromMatrixPosition(y.matrixWorld),x.direction.transformDirection(g),v++}}}return{setup:a,setupView:c,state:n}}function eh(s){const t=new ov(s),e=[],n=[];function i(h){l.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function c(h){t.setupView(e,h)}const l={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function av(s){let t=new WeakMap;function e(i,r=0){const o=t.get(i);let a;return o===void 0?(a=new eh(s),t.set(i,[a])):r>=o.length?(a=new eh(s),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class cv extends Po{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=id,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class lv extends Po{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const hv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,uv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function fv(s,t,e){let n=new Bu;const i=new ct,r=new ct,o=new de,a=new cv({depthPacking:sd}),c=new lv,l={},h=e.maxTextureSize,f={[Yn]:Ae,[Ae]:Yn,[pn]:pn},u=new Ie({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ct},radius:{value:4}},vertexShader:hv,fragmentShader:uv}),d=u.clone();d.defines.HORIZONTAL_PASS=1;const m=new be;m.setAttribute("position",new xe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new ce(m,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=du;let p=this.type;this.render=function(w,T,R){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||w.length===0)return;const S=s.getRenderTarget(),M=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),O=s.state;O.setBlending(hi),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const I=p!==Hn&&this.type===Hn,F=p===Hn&&this.type!==Hn;for(let z=0,D=w.length;z<D;z++){const Y=w[z],G=Y.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;i.copy(G.mapSize);const X=G.getFrameExtents();if(i.multiply(X),r.copy(G.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/X.x),i.x=r.x*X.x,G.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/X.y),i.y=r.y*X.y,G.mapSize.y=r.y)),G.map===null||I===!0||F===!0){const st=this.type!==Hn?{minFilter:$e,magFilter:$e}:{};G.map!==null&&G.map.dispose(),G.map=new $n(i.x,i.y,st),G.map.texture.name=Y.name+".shadowMap",G.camera.updateProjectionMatrix()}s.setRenderTarget(G.map),s.clear();const tt=G.getViewportCount();for(let st=0;st<tt;st++){const J=G.getViewport(st);o.set(r.x*J.x,r.y*J.y,r.x*J.z,r.y*J.w),O.viewport(o),G.updateMatrices(Y,st),n=G.getFrustum(),x(T,R,G.camera,Y,this.type)}G.isPointLightShadow!==!0&&this.type===Hn&&_(G,R),G.needsUpdate=!1}p=this.type,g.needsUpdate=!1,s.setRenderTarget(S,M,P)};function _(w,T){const R=t.update(v);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new $n(i.x,i.y)),u.uniforms.shadow_pass.value=w.map.texture,u.uniforms.resolution.value=w.mapSize,u.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(T,null,R,u,v,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(T,null,R,d,v,null)}function y(w,T,R,S){let M=null;const P=R.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(P!==void 0)M=P;else if(M=R.isPointLight===!0?c:a,s.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const O=M.uuid,I=T.uuid;let F=l[O];F===void 0&&(F={},l[O]=F);let z=F[I];z===void 0&&(z=M.clone(),F[I]=z,T.addEventListener("dispose",C)),M=z}if(M.visible=T.visible,M.wireframe=T.wireframe,S===Hn?M.side=T.shadowSide!==null?T.shadowSide:T.side:M.side=T.shadowSide!==null?T.shadowSide:f[T.side],M.alphaMap=T.alphaMap,M.alphaTest=T.alphaTest,M.map=T.map,M.clipShadows=T.clipShadows,M.clippingPlanes=T.clippingPlanes,M.clipIntersection=T.clipIntersection,M.displacementMap=T.displacementMap,M.displacementScale=T.displacementScale,M.displacementBias=T.displacementBias,M.wireframeLinewidth=T.wireframeLinewidth,M.linewidth=T.linewidth,R.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const O=s.properties.get(M);O.light=R}return M}function x(w,T,R,S,M){if(w.visible===!1)return;if(w.layers.test(T.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&M===Hn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,w.matrixWorld);const I=t.update(w),F=w.material;if(Array.isArray(F)){const z=I.groups;for(let D=0,Y=z.length;D<Y;D++){const G=z[D],X=F[G.materialIndex];if(X&&X.visible){const tt=y(w,X,S,M);w.onBeforeShadow(s,w,T,R,I,tt,G),s.renderBufferDirect(R,null,I,tt,w,G),w.onAfterShadow(s,w,T,R,I,tt,G)}}}else if(F.visible){const z=y(w,F,S,M);w.onBeforeShadow(s,w,T,R,I,z,null),s.renderBufferDirect(R,null,I,z,w,null),w.onAfterShadow(s,w,T,R,I,z,null)}}const O=w.children;for(let I=0,F=O.length;I<F;I++)x(O[I],T,R,S,M)}function C(w){w.target.removeEventListener("dispose",C);for(const R in l){const S=l[R],M=w.target.uuid;M in S&&(S[M].dispose(),delete S[M])}}}const dv={[ka]:Va,[Ga]:qa,[Ha]:Xa,[_s]:Wa,[Va]:ka,[qa]:Ga,[Xa]:Ha,[Wa]:_s};function pv(s,t){function e(){let B=!1;const mt=new de;let j=null;const Q=new de(0,0,0,0);return{setMask:function(_t){j!==_t&&!B&&(s.colorMask(_t,_t,_t,_t),j=_t)},setLocked:function(_t){B=_t},setClear:function(_t,gt,Vt,ue,Ce){Ce===!0&&(_t*=ue,gt*=ue,Vt*=ue),mt.set(_t,gt,Vt,ue),Q.equals(mt)===!1&&(s.clearColor(_t,gt,Vt,ue),Q.copy(mt))},reset:function(){B=!1,j=null,Q.set(-1,0,0,0)}}}function n(){let B=!1,mt=!1,j=null,Q=null,_t=null;return{setReversed:function(gt){if(mt!==gt){const Vt=t.get("EXT_clip_control");mt?Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.ZERO_TO_ONE_EXT):Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.NEGATIVE_ONE_TO_ONE_EXT);const ue=_t;_t=null,this.setClear(ue)}mt=gt},getReversed:function(){return mt},setTest:function(gt){gt?ot(s.DEPTH_TEST):It(s.DEPTH_TEST)},setMask:function(gt){j!==gt&&!B&&(s.depthMask(gt),j=gt)},setFunc:function(gt){if(mt&&(gt=dv[gt]),Q!==gt){switch(gt){case ka:s.depthFunc(s.NEVER);break;case Va:s.depthFunc(s.ALWAYS);break;case Ga:s.depthFunc(s.LESS);break;case _s:s.depthFunc(s.LEQUAL);break;case Ha:s.depthFunc(s.EQUAL);break;case Wa:s.depthFunc(s.GEQUAL);break;case qa:s.depthFunc(s.GREATER);break;case Xa:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Q=gt}},setLocked:function(gt){B=gt},setClear:function(gt){_t!==gt&&(mt&&(gt=1-gt),s.clearDepth(gt),_t=gt)},reset:function(){B=!1,j=null,Q=null,_t=null,mt=!1}}}function i(){let B=!1,mt=null,j=null,Q=null,_t=null,gt=null,Vt=null,ue=null,Ce=null;return{setTest:function(ee){B||(ee?ot(s.STENCIL_TEST):It(s.STENCIL_TEST))},setMask:function(ee){mt!==ee&&!B&&(s.stencilMask(ee),mt=ee)},setFunc:function(ee,on,Pn){(j!==ee||Q!==on||_t!==Pn)&&(s.stencilFunc(ee,on,Pn),j=ee,Q=on,_t=Pn)},setOp:function(ee,on,Pn){(gt!==ee||Vt!==on||ue!==Pn)&&(s.stencilOp(ee,on,Pn),gt=ee,Vt=on,ue=Pn)},setLocked:function(ee){B=ee},setClear:function(ee){Ce!==ee&&(s.clearStencil(ee),Ce=ee)},reset:function(){B=!1,mt=null,j=null,Q=null,_t=null,gt=null,Vt=null,ue=null,Ce=null}}}const r=new e,o=new n,a=new i,c=new WeakMap,l=new WeakMap;let h={},f={},u=new WeakMap,d=[],m=null,v=!1,g=null,p=null,_=null,y=null,x=null,C=null,w=null,T=new zt(0,0,0),R=0,S=!1,M=null,P=null,O=null,I=null,F=null;const z=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let D=!1,Y=0;const G=s.getParameter(s.VERSION);G.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(G)[1]),D=Y>=1):G.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),D=Y>=2);let X=null,tt={};const st=s.getParameter(s.SCISSOR_BOX),J=s.getParameter(s.VIEWPORT),Nt=new de().fromArray(st),$=new de().fromArray(J);function nt(B,mt,j,Q){const _t=new Uint8Array(4),gt=s.createTexture();s.bindTexture(B,gt),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Vt=0;Vt<j;Vt++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(mt,0,s.RGBA,1,1,Q,0,s.RGBA,s.UNSIGNED_BYTE,_t):s.texImage2D(mt+Vt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,_t);return gt}const dt={};dt[s.TEXTURE_2D]=nt(s.TEXTURE_2D,s.TEXTURE_2D,1),dt[s.TEXTURE_CUBE_MAP]=nt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),dt[s.TEXTURE_2D_ARRAY]=nt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),dt[s.TEXTURE_3D]=nt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ot(s.DEPTH_TEST),o.setFunc(_s),rt(!1),St(ol),ot(s.CULL_FACE),N(hi);function ot(B){h[B]!==!0&&(s.enable(B),h[B]=!0)}function It(B){h[B]!==!1&&(s.disable(B),h[B]=!1)}function Ot(B,mt){return f[B]!==mt?(s.bindFramebuffer(B,mt),f[B]=mt,B===s.DRAW_FRAMEBUFFER&&(f[s.FRAMEBUFFER]=mt),B===s.FRAMEBUFFER&&(f[s.DRAW_FRAMEBUFFER]=mt),!0):!1}function Dt(B,mt){let j=d,Q=!1;if(B){j=u.get(mt),j===void 0&&(j=[],u.set(mt,j));const _t=B.textures;if(j.length!==_t.length||j[0]!==s.COLOR_ATTACHMENT0){for(let gt=0,Vt=_t.length;gt<Vt;gt++)j[gt]=s.COLOR_ATTACHMENT0+gt;j.length=_t.length,Q=!0}}else j[0]!==s.BACK&&(j[0]=s.BACK,Q=!0);Q&&s.drawBuffers(j)}function Xt(B){return m!==B?(s.useProgram(B),m=B,!0):!1}const et={[Ti]:s.FUNC_ADD,[Lf]:s.FUNC_SUBTRACT,[If]:s.FUNC_REVERSE_SUBTRACT};et[Nf]=s.MIN,et[Df]=s.MAX;const lt={[Uf]:s.ZERO,[Oa]:s.ONE,[Ff]:s.SRC_COLOR,[Ba]:s.SRC_ALPHA,[Gf]:s.SRC_ALPHA_SATURATE,[kf]:s.DST_COLOR,[Of]:s.DST_ALPHA,[zf]:s.ONE_MINUS_SRC_COLOR,[ar]:s.ONE_MINUS_SRC_ALPHA,[Vf]:s.ONE_MINUS_DST_COLOR,[Bf]:s.ONE_MINUS_DST_ALPHA,[Hf]:s.CONSTANT_COLOR,[Wf]:s.ONE_MINUS_CONSTANT_COLOR,[qf]:s.CONSTANT_ALPHA,[Xf]:s.ONE_MINUS_CONSTANT_ALPHA};function N(B,mt,j,Q,_t,gt,Vt,ue,Ce,ee){if(B===hi){v===!0&&(It(s.BLEND),v=!1);return}if(v===!1&&(ot(s.BLEND),v=!0),B!==pu){if(B!==g||ee!==S){if((p!==Ti||x!==Ti)&&(s.blendEquation(s.FUNC_ADD),p=Ti,x=Ti),ee)switch(B){case fs:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case za:s.blendFunc(s.ONE,s.ONE);break;case al:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case cl:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}else switch(B){case fs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case za:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case al:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case cl:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}_=null,y=null,C=null,w=null,T.set(0,0,0),R=0,g=B,S=ee}return}_t=_t||mt,gt=gt||j,Vt=Vt||Q,(mt!==p||_t!==x)&&(s.blendEquationSeparate(et[mt],et[_t]),p=mt,x=_t),(j!==_||Q!==y||gt!==C||Vt!==w)&&(s.blendFuncSeparate(lt[j],lt[Q],lt[gt],lt[Vt]),_=j,y=Q,C=gt,w=Vt),(ue.equals(T)===!1||Ce!==R)&&(s.blendColor(ue.r,ue.g,ue.b,Ce),T.copy(ue),R=Ce),g=B,S=!1}function Pt(B,mt){B.side===pn?It(s.CULL_FACE):ot(s.CULL_FACE);let j=B.side===Ae;mt&&(j=!j),rt(j),B.blending===fs&&B.transparent===!1?N(hi):N(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);const Q=B.stencilWrite;a.setTest(Q),Q&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Ut(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?ot(s.SAMPLE_ALPHA_TO_COVERAGE):It(s.SAMPLE_ALPHA_TO_COVERAGE)}function rt(B){M!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),M=B)}function St(B){B!==Cf?(ot(s.CULL_FACE),B!==P&&(B===ol?s.cullFace(s.BACK):B===Rf?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):It(s.CULL_FACE),P=B}function ut(B){B!==O&&(D&&s.lineWidth(B),O=B)}function Ut(B,mt,j){B?(ot(s.POLYGON_OFFSET_FILL),(I!==mt||F!==j)&&(s.polygonOffset(mt,j),I=mt,F=j)):It(s.POLYGON_OFFSET_FILL)}function yt(B){B?ot(s.SCISSOR_TEST):It(s.SCISSOR_TEST)}function L(B){B===void 0&&(B=s.TEXTURE0+z-1),X!==B&&(s.activeTexture(B),X=B)}function b(B,mt,j){j===void 0&&(X===null?j=s.TEXTURE0+z-1:j=X);let Q=tt[j];Q===void 0&&(Q={type:void 0,texture:void 0},tt[j]=Q),(Q.type!==B||Q.texture!==mt)&&(X!==j&&(s.activeTexture(j),X=j),s.bindTexture(B,mt||dt[B]),Q.type=B,Q.texture=mt)}function H(){const B=tt[X];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function Z(){try{s.compressedTexImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function it(){try{s.compressedTexImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function K(){try{s.texSubImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Tt(){try{s.texSubImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function pt(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Mt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Yt(){try{s.texStorage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function at(){try{s.texStorage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function wt(){try{s.texImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ft(){try{s.texImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Bt(B){Nt.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),Nt.copy(B))}function bt(B){$.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),$.copy(B))}function $t(B,mt){let j=l.get(mt);j===void 0&&(j=new WeakMap,l.set(mt,j));let Q=j.get(B);Q===void 0&&(Q=s.getUniformBlockIndex(mt,B.name),j.set(B,Q))}function Wt(B,mt){const Q=l.get(mt).get(B);c.get(mt)!==Q&&(s.uniformBlockBinding(mt,Q,B.__bindingPointIndex),c.set(mt,Q))}function ie(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},X=null,tt={},f={},u=new WeakMap,d=[],m=null,v=!1,g=null,p=null,_=null,y=null,x=null,C=null,w=null,T=new zt(0,0,0),R=0,S=!1,M=null,P=null,O=null,I=null,F=null,Nt.set(0,0,s.canvas.width,s.canvas.height),$.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ot,disable:It,bindFramebuffer:Ot,drawBuffers:Dt,useProgram:Xt,setBlending:N,setMaterial:Pt,setFlipSided:rt,setCullFace:St,setLineWidth:ut,setPolygonOffset:Ut,setScissorTest:yt,activeTexture:L,bindTexture:b,unbindTexture:H,compressedTexImage2D:Z,compressedTexImage3D:it,texImage2D:wt,texImage3D:Ft,updateUBOMapping:$t,uniformBlockBinding:Wt,texStorage2D:Yt,texStorage3D:at,texSubImage2D:K,texSubImage3D:Tt,compressedTexSubImage2D:pt,compressedTexSubImage3D:Mt,scissor:Bt,viewport:bt,reset:ie}}function nh(s,t,e,n){const i=mv(n);switch(e){case yu:return s*t;case Su:return s*t;case Eu:return s*t*2;case wu:return s*t/i.components*i.byteLength;case Uc:return s*t/i.components*i.byteLength;case bu:return s*t*2/i.components*i.byteLength;case Fc:return s*t*2/i.components*i.byteLength;case Mu:return s*t*3/i.components*i.byteLength;case en:return s*t*4/i.components*i.byteLength;case zc:return s*t*4/i.components*i.byteLength;case uo:case fo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case po:case mo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ja:case tc:return Math.max(s,16)*Math.max(t,8)/4;case Ka:case Qa:return Math.max(s,8)*Math.max(t,8)/2;case ec:case nc:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case ic:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case sc:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case rc:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case oc:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case ac:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case cc:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case lc:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case hc:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case uc:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case fc:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case dc:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case pc:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case mc:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case gc:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case vc:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case go:case _c:case xc:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Tu:case yc:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Mc:case Sc:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function mv(s){switch(s){case An:case vu:return{byteLength:1,components:1};case cr:case _u:case Rs:return{byteLength:2,components:1};case Nc:case Dc:return{byteLength:2,components:4};case Di:case Ic:case bn:return{byteLength:4,components:1};case xu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function gv(s,t,e,n,i,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ct,h=new WeakMap;let f;const u=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(L,b){return d?new OffscreenCanvas(L,b):So("canvas")}function v(L,b,H){let Z=1;const it=yt(L);if((it.width>H||it.height>H)&&(Z=H/Math.max(it.width,it.height)),Z<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){const K=Math.floor(Z*it.width),Tt=Math.floor(Z*it.height);f===void 0&&(f=m(K,Tt));const pt=b?m(K,Tt):f;return pt.width=K,pt.height=Tt,pt.getContext("2d").drawImage(L,0,0,K,Tt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+it.width+"x"+it.height+") to ("+K+"x"+Tt+")."),pt}else return"data"in L&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+it.width+"x"+it.height+")."),L;return L}function g(L){return L.generateMipmaps}function p(L){s.generateMipmap(L)}function _(L){return L.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?s.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(L,b,H,Z,it=!1){if(L!==null){if(s[L]!==void 0)return s[L];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let K=b;if(b===s.RED&&(H===s.FLOAT&&(K=s.R32F),H===s.HALF_FLOAT&&(K=s.R16F),H===s.UNSIGNED_BYTE&&(K=s.R8)),b===s.RED_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.R8UI),H===s.UNSIGNED_SHORT&&(K=s.R16UI),H===s.UNSIGNED_INT&&(K=s.R32UI),H===s.BYTE&&(K=s.R8I),H===s.SHORT&&(K=s.R16I),H===s.INT&&(K=s.R32I)),b===s.RG&&(H===s.FLOAT&&(K=s.RG32F),H===s.HALF_FLOAT&&(K=s.RG16F),H===s.UNSIGNED_BYTE&&(K=s.RG8)),b===s.RG_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RG8UI),H===s.UNSIGNED_SHORT&&(K=s.RG16UI),H===s.UNSIGNED_INT&&(K=s.RG32UI),H===s.BYTE&&(K=s.RG8I),H===s.SHORT&&(K=s.RG16I),H===s.INT&&(K=s.RG32I)),b===s.RGB_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RGB8UI),H===s.UNSIGNED_SHORT&&(K=s.RGB16UI),H===s.UNSIGNED_INT&&(K=s.RGB32UI),H===s.BYTE&&(K=s.RGB8I),H===s.SHORT&&(K=s.RGB16I),H===s.INT&&(K=s.RGB32I)),b===s.RGBA_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),H===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),H===s.UNSIGNED_INT&&(K=s.RGBA32UI),H===s.BYTE&&(K=s.RGBA8I),H===s.SHORT&&(K=s.RGBA16I),H===s.INT&&(K=s.RGBA32I)),b===s.RGB&&H===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),b===s.RGBA){const Tt=it?Co:jt.getTransfer(Z);H===s.FLOAT&&(K=s.RGBA32F),H===s.HALF_FLOAT&&(K=s.RGBA16F),H===s.UNSIGNED_BYTE&&(K=Tt===ne?s.SRGB8_ALPHA8:s.RGBA8),H===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),H===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function x(L,b){let H;return L?b===null||b===Di||b===Ms?H=s.DEPTH24_STENCIL8:b===bn?H=s.DEPTH32F_STENCIL8:b===cr&&(H=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Di||b===Ms?H=s.DEPTH_COMPONENT24:b===bn?H=s.DEPTH_COMPONENT32F:b===cr&&(H=s.DEPTH_COMPONENT16),H}function C(L,b){return g(L)===!0||L.isFramebufferTexture&&L.minFilter!==$e&&L.minFilter!==wn?Math.log2(Math.max(b.width,b.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?b.mipmaps.length:1}function w(L){const b=L.target;b.removeEventListener("dispose",w),R(b),b.isVideoTexture&&h.delete(b)}function T(L){const b=L.target;b.removeEventListener("dispose",T),M(b)}function R(L){const b=n.get(L);if(b.__webglInit===void 0)return;const H=L.source,Z=u.get(H);if(Z){const it=Z[b.__cacheKey];it.usedTimes--,it.usedTimes===0&&S(L),Object.keys(Z).length===0&&u.delete(H)}n.remove(L)}function S(L){const b=n.get(L);s.deleteTexture(b.__webglTexture);const H=L.source,Z=u.get(H);delete Z[b.__cacheKey],o.memory.textures--}function M(L){const b=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(b.__webglFramebuffer[Z]))for(let it=0;it<b.__webglFramebuffer[Z].length;it++)s.deleteFramebuffer(b.__webglFramebuffer[Z][it]);else s.deleteFramebuffer(b.__webglFramebuffer[Z]);b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer[Z])}else{if(Array.isArray(b.__webglFramebuffer))for(let Z=0;Z<b.__webglFramebuffer.length;Z++)s.deleteFramebuffer(b.__webglFramebuffer[Z]);else s.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&s.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&s.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let Z=0;Z<b.__webglColorRenderbuffer.length;Z++)b.__webglColorRenderbuffer[Z]&&s.deleteRenderbuffer(b.__webglColorRenderbuffer[Z]);b.__webglDepthRenderbuffer&&s.deleteRenderbuffer(b.__webglDepthRenderbuffer)}const H=L.textures;for(let Z=0,it=H.length;Z<it;Z++){const K=n.get(H[Z]);K.__webglTexture&&(s.deleteTexture(K.__webglTexture),o.memory.textures--),n.remove(H[Z])}n.remove(L)}let P=0;function O(){P=0}function I(){const L=P;return L>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+i.maxTextures),P+=1,L}function F(L){const b=[];return b.push(L.wrapS),b.push(L.wrapT),b.push(L.wrapR||0),b.push(L.magFilter),b.push(L.minFilter),b.push(L.anisotropy),b.push(L.internalFormat),b.push(L.format),b.push(L.type),b.push(L.generateMipmaps),b.push(L.premultiplyAlpha),b.push(L.flipY),b.push(L.unpackAlignment),b.push(L.colorSpace),b.join()}function z(L,b){const H=n.get(L);if(L.isVideoTexture&&ut(L),L.isRenderTargetTexture===!1&&L.version>0&&H.__version!==L.version){const Z=L.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{$(H,L,b);return}}e.bindTexture(s.TEXTURE_2D,H.__webglTexture,s.TEXTURE0+b)}function D(L,b){const H=n.get(L);if(L.version>0&&H.__version!==L.version){$(H,L,b);return}e.bindTexture(s.TEXTURE_2D_ARRAY,H.__webglTexture,s.TEXTURE0+b)}function Y(L,b){const H=n.get(L);if(L.version>0&&H.__version!==L.version){$(H,L,b);return}e.bindTexture(s.TEXTURE_3D,H.__webglTexture,s.TEXTURE0+b)}function G(L,b){const H=n.get(L);if(L.version>0&&H.__version!==L.version){nt(H,L,b);return}e.bindTexture(s.TEXTURE_CUBE_MAP,H.__webglTexture,s.TEXTURE0+b)}const X={[ja]:s.REPEAT,[Ri]:s.CLAMP_TO_EDGE,[Za]:s.MIRRORED_REPEAT},tt={[$e]:s.NEAREST,[nd]:s.NEAREST_MIPMAP_NEAREST,[Mr]:s.NEAREST_MIPMAP_LINEAR,[wn]:s.LINEAR,[ko]:s.LINEAR_MIPMAP_NEAREST,[Pi]:s.LINEAR_MIPMAP_LINEAR},st={[ad]:s.NEVER,[dd]:s.ALWAYS,[cd]:s.LESS,[Au]:s.LEQUAL,[ld]:s.EQUAL,[fd]:s.GEQUAL,[hd]:s.GREATER,[ud]:s.NOTEQUAL};function J(L,b){if(b.type===bn&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===wn||b.magFilter===ko||b.magFilter===Mr||b.magFilter===Pi||b.minFilter===wn||b.minFilter===ko||b.minFilter===Mr||b.minFilter===Pi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(L,s.TEXTURE_WRAP_S,X[b.wrapS]),s.texParameteri(L,s.TEXTURE_WRAP_T,X[b.wrapT]),(L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY)&&s.texParameteri(L,s.TEXTURE_WRAP_R,X[b.wrapR]),s.texParameteri(L,s.TEXTURE_MAG_FILTER,tt[b.magFilter]),s.texParameteri(L,s.TEXTURE_MIN_FILTER,tt[b.minFilter]),b.compareFunction&&(s.texParameteri(L,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(L,s.TEXTURE_COMPARE_FUNC,st[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===$e||b.minFilter!==Mr&&b.minFilter!==Pi||b.type===bn&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){const H=t.get("EXT_texture_filter_anisotropic");s.texParameterf(L,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,i.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Nt(L,b){let H=!1;L.__webglInit===void 0&&(L.__webglInit=!0,b.addEventListener("dispose",w));const Z=b.source;let it=u.get(Z);it===void 0&&(it={},u.set(Z,it));const K=F(b);if(K!==L.__cacheKey){it[K]===void 0&&(it[K]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,H=!0),it[K].usedTimes++;const Tt=it[L.__cacheKey];Tt!==void 0&&(it[L.__cacheKey].usedTimes--,Tt.usedTimes===0&&S(b)),L.__cacheKey=K,L.__webglTexture=it[K].texture}return H}function $(L,b,H){let Z=s.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(Z=s.TEXTURE_2D_ARRAY),b.isData3DTexture&&(Z=s.TEXTURE_3D);const it=Nt(L,b),K=b.source;e.bindTexture(Z,L.__webglTexture,s.TEXTURE0+H);const Tt=n.get(K);if(K.version!==Tt.__version||it===!0){e.activeTexture(s.TEXTURE0+H);const pt=jt.getPrimaries(jt.workingColorSpace),Mt=b.colorSpace===oi?null:jt.getPrimaries(b.colorSpace),Yt=b.colorSpace===oi||pt===Mt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Yt);let at=v(b.image,!1,i.maxTextureSize);at=Ut(b,at);const wt=r.convert(b.format,b.colorSpace),Ft=r.convert(b.type);let Bt=y(b.internalFormat,wt,Ft,b.colorSpace,b.isVideoTexture);J(Z,b);let bt;const $t=b.mipmaps,Wt=b.isVideoTexture!==!0,ie=Tt.__version===void 0||it===!0,B=K.dataReady,mt=C(b,at);if(b.isDepthTexture)Bt=x(b.format===Ss,b.type),ie&&(Wt?e.texStorage2D(s.TEXTURE_2D,1,Bt,at.width,at.height):e.texImage2D(s.TEXTURE_2D,0,Bt,at.width,at.height,0,wt,Ft,null));else if(b.isDataTexture)if($t.length>0){Wt&&ie&&e.texStorage2D(s.TEXTURE_2D,mt,Bt,$t[0].width,$t[0].height);for(let j=0,Q=$t.length;j<Q;j++)bt=$t[j],Wt?B&&e.texSubImage2D(s.TEXTURE_2D,j,0,0,bt.width,bt.height,wt,Ft,bt.data):e.texImage2D(s.TEXTURE_2D,j,Bt,bt.width,bt.height,0,wt,Ft,bt.data);b.generateMipmaps=!1}else Wt?(ie&&e.texStorage2D(s.TEXTURE_2D,mt,Bt,at.width,at.height),B&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,at.width,at.height,wt,Ft,at.data)):e.texImage2D(s.TEXTURE_2D,0,Bt,at.width,at.height,0,wt,Ft,at.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Wt&&ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,mt,Bt,$t[0].width,$t[0].height,at.depth);for(let j=0,Q=$t.length;j<Q;j++)if(bt=$t[j],b.format!==en)if(wt!==null)if(Wt){if(B)if(b.layerUpdates.size>0){const _t=nh(bt.width,bt.height,b.format,b.type);for(const gt of b.layerUpdates){const Vt=bt.data.subarray(gt*_t/bt.data.BYTES_PER_ELEMENT,(gt+1)*_t/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,j,0,0,gt,bt.width,bt.height,1,wt,Vt)}b.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,j,0,0,0,bt.width,bt.height,at.depth,wt,bt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,j,Bt,bt.width,bt.height,at.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Wt?B&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,j,0,0,0,bt.width,bt.height,at.depth,wt,Ft,bt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,j,Bt,bt.width,bt.height,at.depth,0,wt,Ft,bt.data)}else{Wt&&ie&&e.texStorage2D(s.TEXTURE_2D,mt,Bt,$t[0].width,$t[0].height);for(let j=0,Q=$t.length;j<Q;j++)bt=$t[j],b.format!==en?wt!==null?Wt?B&&e.compressedTexSubImage2D(s.TEXTURE_2D,j,0,0,bt.width,bt.height,wt,bt.data):e.compressedTexImage2D(s.TEXTURE_2D,j,Bt,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Wt?B&&e.texSubImage2D(s.TEXTURE_2D,j,0,0,bt.width,bt.height,wt,Ft,bt.data):e.texImage2D(s.TEXTURE_2D,j,Bt,bt.width,bt.height,0,wt,Ft,bt.data)}else if(b.isDataArrayTexture)if(Wt){if(ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,mt,Bt,at.width,at.height,at.depth),B)if(b.layerUpdates.size>0){const j=nh(at.width,at.height,b.format,b.type);for(const Q of b.layerUpdates){const _t=at.data.subarray(Q*j/at.data.BYTES_PER_ELEMENT,(Q+1)*j/at.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Q,at.width,at.height,1,wt,Ft,_t)}b.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,at.width,at.height,at.depth,wt,Ft,at.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Bt,at.width,at.height,at.depth,0,wt,Ft,at.data);else if(b.isData3DTexture)Wt?(ie&&e.texStorage3D(s.TEXTURE_3D,mt,Bt,at.width,at.height,at.depth),B&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,at.width,at.height,at.depth,wt,Ft,at.data)):e.texImage3D(s.TEXTURE_3D,0,Bt,at.width,at.height,at.depth,0,wt,Ft,at.data);else if(b.isFramebufferTexture){if(ie)if(Wt)e.texStorage2D(s.TEXTURE_2D,mt,Bt,at.width,at.height);else{let j=at.width,Q=at.height;for(let _t=0;_t<mt;_t++)e.texImage2D(s.TEXTURE_2D,_t,Bt,j,Q,0,wt,Ft,null),j>>=1,Q>>=1}}else if($t.length>0){if(Wt&&ie){const j=yt($t[0]);e.texStorage2D(s.TEXTURE_2D,mt,Bt,j.width,j.height)}for(let j=0,Q=$t.length;j<Q;j++)bt=$t[j],Wt?B&&e.texSubImage2D(s.TEXTURE_2D,j,0,0,wt,Ft,bt):e.texImage2D(s.TEXTURE_2D,j,Bt,wt,Ft,bt);b.generateMipmaps=!1}else if(Wt){if(ie){const j=yt(at);e.texStorage2D(s.TEXTURE_2D,mt,Bt,j.width,j.height)}B&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,wt,Ft,at)}else e.texImage2D(s.TEXTURE_2D,0,Bt,wt,Ft,at);g(b)&&p(Z),Tt.__version=K.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function nt(L,b,H){if(b.image.length!==6)return;const Z=Nt(L,b),it=b.source;e.bindTexture(s.TEXTURE_CUBE_MAP,L.__webglTexture,s.TEXTURE0+H);const K=n.get(it);if(it.version!==K.__version||Z===!0){e.activeTexture(s.TEXTURE0+H);const Tt=jt.getPrimaries(jt.workingColorSpace),pt=b.colorSpace===oi?null:jt.getPrimaries(b.colorSpace),Mt=b.colorSpace===oi||Tt===pt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,b.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,b.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);const Yt=b.isCompressedTexture||b.image[0].isCompressedTexture,at=b.image[0]&&b.image[0].isDataTexture,wt=[];for(let Q=0;Q<6;Q++)!Yt&&!at?wt[Q]=v(b.image[Q],!0,i.maxCubemapSize):wt[Q]=at?b.image[Q].image:b.image[Q],wt[Q]=Ut(b,wt[Q]);const Ft=wt[0],Bt=r.convert(b.format,b.colorSpace),bt=r.convert(b.type),$t=y(b.internalFormat,Bt,bt,b.colorSpace),Wt=b.isVideoTexture!==!0,ie=K.__version===void 0||Z===!0,B=it.dataReady;let mt=C(b,Ft);J(s.TEXTURE_CUBE_MAP,b);let j;if(Yt){Wt&&ie&&e.texStorage2D(s.TEXTURE_CUBE_MAP,mt,$t,Ft.width,Ft.height);for(let Q=0;Q<6;Q++){j=wt[Q].mipmaps;for(let _t=0;_t<j.length;_t++){const gt=j[_t];b.format!==en?Bt!==null?Wt?B&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t,0,0,gt.width,gt.height,Bt,gt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t,$t,gt.width,gt.height,0,gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Wt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t,0,0,gt.width,gt.height,Bt,bt,gt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t,$t,gt.width,gt.height,0,Bt,bt,gt.data)}}}else{if(j=b.mipmaps,Wt&&ie){j.length>0&&mt++;const Q=yt(wt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,mt,$t,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(at){Wt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,wt[Q].width,wt[Q].height,Bt,bt,wt[Q].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,$t,wt[Q].width,wt[Q].height,0,Bt,bt,wt[Q].data);for(let _t=0;_t<j.length;_t++){const Vt=j[_t].image[Q].image;Wt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t+1,0,0,Vt.width,Vt.height,Bt,bt,Vt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t+1,$t,Vt.width,Vt.height,0,Bt,bt,Vt.data)}}else{Wt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Bt,bt,wt[Q]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,$t,Bt,bt,wt[Q]);for(let _t=0;_t<j.length;_t++){const gt=j[_t];Wt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t+1,0,0,Bt,bt,gt.image[Q]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,_t+1,$t,Bt,bt,gt.image[Q])}}}g(b)&&p(s.TEXTURE_CUBE_MAP),K.__version=it.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function dt(L,b,H,Z,it,K){const Tt=r.convert(H.format,H.colorSpace),pt=r.convert(H.type),Mt=y(H.internalFormat,Tt,pt,H.colorSpace),Yt=n.get(b),at=n.get(H);if(at.__renderTarget=b,!Yt.__hasExternalTextures){const wt=Math.max(1,b.width>>K),Ft=Math.max(1,b.height>>K);it===s.TEXTURE_3D||it===s.TEXTURE_2D_ARRAY?e.texImage3D(it,K,Mt,wt,Ft,b.depth,0,Tt,pt,null):e.texImage2D(it,K,Mt,wt,Ft,0,Tt,pt,null)}e.bindFramebuffer(s.FRAMEBUFFER,L),St(b)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Z,it,at.__webglTexture,0,rt(b)):(it===s.TEXTURE_2D||it>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&it<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Z,it,at.__webglTexture,K),e.bindFramebuffer(s.FRAMEBUFFER,null)}function ot(L,b,H){if(s.bindRenderbuffer(s.RENDERBUFFER,L),b.depthBuffer){const Z=b.depthTexture,it=Z&&Z.isDepthTexture?Z.type:null,K=x(b.stencilBuffer,it),Tt=b.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=rt(b);St(b)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,pt,K,b.width,b.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,pt,K,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,K,b.width,b.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Tt,s.RENDERBUFFER,L)}else{const Z=b.textures;for(let it=0;it<Z.length;it++){const K=Z[it],Tt=r.convert(K.format,K.colorSpace),pt=r.convert(K.type),Mt=y(K.internalFormat,Tt,pt,K.colorSpace),Yt=rt(b);H&&St(b)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Yt,Mt,b.width,b.height):St(b)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Yt,Mt,b.width,b.height):s.renderbufferStorage(s.RENDERBUFFER,Mt,b.width,b.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function It(L,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,L),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=n.get(b.depthTexture);Z.__renderTarget=b,(!Z.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),z(b.depthTexture,0);const it=Z.__webglTexture,K=rt(b);if(b.depthTexture.format===ds)St(b)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,it,0,K):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,it,0);else if(b.depthTexture.format===Ss)St(b)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,it,0,K):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,it,0);else throw new Error("Unknown depthTexture format")}function Ot(L){const b=n.get(L),H=L.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==L.depthTexture){const Z=L.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),Z){const it=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,Z.removeEventListener("dispose",it)};Z.addEventListener("dispose",it),b.__depthDisposeCallback=it}b.__boundDepthTexture=Z}if(L.depthTexture&&!b.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");It(b.__webglFramebuffer,L)}else if(H){b.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer[Z]),b.__webglDepthbuffer[Z]===void 0)b.__webglDepthbuffer[Z]=s.createRenderbuffer(),ot(b.__webglDepthbuffer[Z],L,!1);else{const it=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,K=b.__webglDepthbuffer[Z];s.bindRenderbuffer(s.RENDERBUFFER,K),s.framebufferRenderbuffer(s.FRAMEBUFFER,it,s.RENDERBUFFER,K)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=s.createRenderbuffer(),ot(b.__webglDepthbuffer,L,!1);else{const Z=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,it=b.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,it),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,it)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Dt(L,b,H){const Z=n.get(L);b!==void 0&&dt(Z.__webglFramebuffer,L,L.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),H!==void 0&&Ot(L)}function Xt(L){const b=L.texture,H=n.get(L),Z=n.get(b);L.addEventListener("dispose",T);const it=L.textures,K=L.isWebGLCubeRenderTarget===!0,Tt=it.length>1;if(Tt||(Z.__webglTexture===void 0&&(Z.__webglTexture=s.createTexture()),Z.__version=b.version,o.memory.textures++),K){H.__webglFramebuffer=[];for(let pt=0;pt<6;pt++)if(b.mipmaps&&b.mipmaps.length>0){H.__webglFramebuffer[pt]=[];for(let Mt=0;Mt<b.mipmaps.length;Mt++)H.__webglFramebuffer[pt][Mt]=s.createFramebuffer()}else H.__webglFramebuffer[pt]=s.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){H.__webglFramebuffer=[];for(let pt=0;pt<b.mipmaps.length;pt++)H.__webglFramebuffer[pt]=s.createFramebuffer()}else H.__webglFramebuffer=s.createFramebuffer();if(Tt)for(let pt=0,Mt=it.length;pt<Mt;pt++){const Yt=n.get(it[pt]);Yt.__webglTexture===void 0&&(Yt.__webglTexture=s.createTexture(),o.memory.textures++)}if(L.samples>0&&St(L)===!1){H.__webglMultisampledFramebuffer=s.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let pt=0;pt<it.length;pt++){const Mt=it[pt];H.__webglColorRenderbuffer[pt]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,H.__webglColorRenderbuffer[pt]);const Yt=r.convert(Mt.format,Mt.colorSpace),at=r.convert(Mt.type),wt=y(Mt.internalFormat,Yt,at,Mt.colorSpace,L.isXRRenderTarget===!0),Ft=rt(L);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ft,wt,L.width,L.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,H.__webglColorRenderbuffer[pt])}s.bindRenderbuffer(s.RENDERBUFFER,null),L.depthBuffer&&(H.__webglDepthRenderbuffer=s.createRenderbuffer(),ot(H.__webglDepthRenderbuffer,L,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(K){e.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),J(s.TEXTURE_CUBE_MAP,b);for(let pt=0;pt<6;pt++)if(b.mipmaps&&b.mipmaps.length>0)for(let Mt=0;Mt<b.mipmaps.length;Mt++)dt(H.__webglFramebuffer[pt][Mt],L,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+pt,Mt);else dt(H.__webglFramebuffer[pt],L,b,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+pt,0);g(b)&&p(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Tt){for(let pt=0,Mt=it.length;pt<Mt;pt++){const Yt=it[pt],at=n.get(Yt);e.bindTexture(s.TEXTURE_2D,at.__webglTexture),J(s.TEXTURE_2D,Yt),dt(H.__webglFramebuffer,L,Yt,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,0),g(Yt)&&p(s.TEXTURE_2D)}e.unbindTexture()}else{let pt=s.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(pt=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(pt,Z.__webglTexture),J(pt,b),b.mipmaps&&b.mipmaps.length>0)for(let Mt=0;Mt<b.mipmaps.length;Mt++)dt(H.__webglFramebuffer[Mt],L,b,s.COLOR_ATTACHMENT0,pt,Mt);else dt(H.__webglFramebuffer,L,b,s.COLOR_ATTACHMENT0,pt,0);g(b)&&p(pt),e.unbindTexture()}L.depthBuffer&&Ot(L)}function et(L){const b=L.textures;for(let H=0,Z=b.length;H<Z;H++){const it=b[H];if(g(it)){const K=_(L),Tt=n.get(it).__webglTexture;e.bindTexture(K,Tt),p(K),e.unbindTexture()}}}const lt=[],N=[];function Pt(L){if(L.samples>0){if(St(L)===!1){const b=L.textures,H=L.width,Z=L.height;let it=s.COLOR_BUFFER_BIT;const K=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Tt=n.get(L),pt=b.length>1;if(pt)for(let Mt=0;Mt<b.length;Mt++)e.bindFramebuffer(s.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,Tt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Tt.__webglFramebuffer);for(let Mt=0;Mt<b.length;Mt++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(it|=s.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(it|=s.STENCIL_BUFFER_BIT)),pt){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Tt.__webglColorRenderbuffer[Mt]);const Yt=n.get(b[Mt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Yt,0)}s.blitFramebuffer(0,0,H,Z,0,0,H,Z,it,s.NEAREST),c===!0&&(lt.length=0,N.length=0,lt.push(s.COLOR_ATTACHMENT0+Mt),L.depthBuffer&&L.resolveDepthBuffer===!1&&(lt.push(K),N.push(K),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,N)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,lt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),pt)for(let Mt=0;Mt<b.length;Mt++){e.bindFramebuffer(s.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.RENDERBUFFER,Tt.__webglColorRenderbuffer[Mt]);const Yt=n.get(b[Mt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,Tt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Mt,s.TEXTURE_2D,Yt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&c){const b=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[b])}}}function rt(L){return Math.min(i.maxSamples,L.samples)}function St(L){const b=n.get(L);return L.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function ut(L){const b=o.render.frame;h.get(L)!==b&&(h.set(L,b),L.update())}function Ut(L,b){const H=L.colorSpace,Z=L.format,it=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||H!==Ps&&H!==oi&&(jt.getTransfer(H)===ne?(Z!==en||it!==An)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),b}function yt(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(l.width=L.naturalWidth||L.width,l.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(l.width=L.displayWidth,l.height=L.displayHeight):(l.width=L.width,l.height=L.height),l}this.allocateTextureUnit=I,this.resetTextureUnits=O,this.setTexture2D=z,this.setTexture2DArray=D,this.setTexture3D=Y,this.setTextureCube=G,this.rebindTextures=Dt,this.setupRenderTarget=Xt,this.updateRenderTargetMipmap=et,this.updateMultisampleRenderTarget=Pt,this.setupDepthRenderbuffer=Ot,this.setupFrameBufferTexture=dt,this.useMultisampledRTT=St}function vv(s,t){function e(n,i=oi){let r;const o=jt.getTransfer(i);if(n===An)return s.UNSIGNED_BYTE;if(n===Nc)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Dc)return s.UNSIGNED_SHORT_5_5_5_1;if(n===xu)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===vu)return s.BYTE;if(n===_u)return s.SHORT;if(n===cr)return s.UNSIGNED_SHORT;if(n===Ic)return s.INT;if(n===Di)return s.UNSIGNED_INT;if(n===bn)return s.FLOAT;if(n===Rs)return s.HALF_FLOAT;if(n===yu)return s.ALPHA;if(n===Mu)return s.RGB;if(n===en)return s.RGBA;if(n===Su)return s.LUMINANCE;if(n===Eu)return s.LUMINANCE_ALPHA;if(n===ds)return s.DEPTH_COMPONENT;if(n===Ss)return s.DEPTH_STENCIL;if(n===wu)return s.RED;if(n===Uc)return s.RED_INTEGER;if(n===bu)return s.RG;if(n===Fc)return s.RG_INTEGER;if(n===zc)return s.RGBA_INTEGER;if(n===uo||n===fo||n===po||n===mo)if(o===ne)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===uo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===fo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===uo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===fo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===po)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===mo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ka||n===Ja||n===Qa||n===tc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ka)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ja)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Qa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===tc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ec||n===nc||n===ic)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ec||n===nc)return o===ne?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ic)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===sc||n===rc||n===oc||n===ac||n===cc||n===lc||n===hc||n===uc||n===fc||n===dc||n===pc||n===mc||n===gc||n===vc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===sc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===rc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===oc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ac)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===cc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===lc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===hc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===uc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===fc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===dc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===pc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===mc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===gc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===vc)return o===ne?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===go||n===_c||n===xc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===go)return o===ne?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===_c)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===xc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Tu||n===yc||n===Mc||n===Sc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===go)return r.COMPRESSED_RED_RGTC1_EXT;if(n===yc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Mc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Sc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ms?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}class _v extends tn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class ai extends Ge{constructor(){super(),this.isGroup=!0,this.type="Group"}}const xv={type:"move"};class ma{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ai,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ai,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ai,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const v of t.hand.values()){const g=e.getJointPose(v,n),p=this._getHandJoint(l,v);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const h=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],u=h.position.distanceTo(f.position),d=.02,m=.005;l.inputState.pinching&&u>d+m?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&u<=d-m&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(xv)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new ai;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const yv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Mv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Sv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new ze,r=t.properties.get(i);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Ie({vertexShader:yv,fragmentShader:Mv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ce(new Ns(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Ev extends Ls{constructor(t,e){super();const n=this;let i=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,f=null,u=null,d=null,m=null;const v=new Sv,g=e.getContextAttributes();let p=null,_=null;const y=[],x=[],C=new ct;let w=null;const T=new tn;T.viewport=new de;const R=new tn;R.viewport=new de;const S=[T,R],M=new _v;let P=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let nt=y[$];return nt===void 0&&(nt=new ma,y[$]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function($){let nt=y[$];return nt===void 0&&(nt=new ma,y[$]=nt),nt.getGripSpace()},this.getHand=function($){let nt=y[$];return nt===void 0&&(nt=new ma,y[$]=nt),nt.getHandSpace()};function I($){const nt=x.indexOf($.inputSource);if(nt===-1)return;const dt=y[nt];dt!==void 0&&(dt.update($.inputSource,$.frame,l||o),dt.dispatchEvent({type:$.type,data:$.inputSource}))}function F(){i.removeEventListener("select",I),i.removeEventListener("selectstart",I),i.removeEventListener("selectend",I),i.removeEventListener("squeeze",I),i.removeEventListener("squeezestart",I),i.removeEventListener("squeezeend",I),i.removeEventListener("end",F),i.removeEventListener("inputsourceschange",z);for(let $=0;$<y.length;$++){const nt=x[$];nt!==null&&(x[$]=null,y[$].disconnect(nt))}P=null,O=null,v.reset(),t.setRenderTarget(p),d=null,u=null,f=null,i=null,_=null,Nt.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function($){l=$},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return f},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function($){if(i=$,i!==null){if(p=t.getRenderTarget(),i.addEventListener("select",I),i.addEventListener("selectstart",I),i.addEventListener("selectend",I),i.addEventListener("squeeze",I),i.addEventListener("squeezestart",I),i.addEventListener("squeezeend",I),i.addEventListener("end",F),i.addEventListener("inputsourceschange",z),g.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(C),i.renderState.layers===void 0){const nt={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,e,nt),i.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new $n(d.framebufferWidth,d.framebufferHeight,{format:en,type:An,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil})}else{let nt=null,dt=null,ot=null;g.depth&&(ot=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,nt=g.stencil?Ss:ds,dt=g.stencil?Ms:Di);const It={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};f=new XRWebGLBinding(i,e),u=f.createProjectionLayer(It),i.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),_=new $n(u.textureWidth,u.textureHeight,{format:en,type:An,depthTexture:new Gu(u.textureWidth,u.textureHeight,dt,void 0,void 0,void 0,void 0,void 0,void 0,nt),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),Nt.setContext(i),Nt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function z($){for(let nt=0;nt<$.removed.length;nt++){const dt=$.removed[nt],ot=x.indexOf(dt);ot>=0&&(x[ot]=null,y[ot].disconnect(dt))}for(let nt=0;nt<$.added.length;nt++){const dt=$.added[nt];let ot=x.indexOf(dt);if(ot===-1){for(let Ot=0;Ot<y.length;Ot++)if(Ot>=x.length){x.push(dt),ot=Ot;break}else if(x[Ot]===null){x[Ot]=dt,ot=Ot;break}if(ot===-1)break}const It=y[ot];It&&It.connect(dt)}}const D=new U,Y=new U;function G($,nt,dt){D.setFromMatrixPosition(nt.matrixWorld),Y.setFromMatrixPosition(dt.matrixWorld);const ot=D.distanceTo(Y),It=nt.projectionMatrix.elements,Ot=dt.projectionMatrix.elements,Dt=It[14]/(It[10]-1),Xt=It[14]/(It[10]+1),et=(It[9]+1)/It[5],lt=(It[9]-1)/It[5],N=(It[8]-1)/It[0],Pt=(Ot[8]+1)/Ot[0],rt=Dt*N,St=Dt*Pt,ut=ot/(-N+Pt),Ut=ut*-N;if(nt.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(Ut),$.translateZ(ut),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),It[10]===-1)$.projectionMatrix.copy(nt.projectionMatrix),$.projectionMatrixInverse.copy(nt.projectionMatrixInverse);else{const yt=Dt+ut,L=Xt+ut,b=rt-Ut,H=St+(ot-Ut),Z=et*Xt/L*yt,it=lt*Xt/L*yt;$.projectionMatrix.makePerspective(b,H,Z,it,yt,L),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function X($,nt){nt===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(nt.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(i===null)return;let nt=$.near,dt=$.far;v.texture!==null&&(v.depthNear>0&&(nt=v.depthNear),v.depthFar>0&&(dt=v.depthFar)),M.near=R.near=T.near=nt,M.far=R.far=T.far=dt,(P!==M.near||O!==M.far)&&(i.updateRenderState({depthNear:M.near,depthFar:M.far}),P=M.near,O=M.far),T.layers.mask=$.layers.mask|2,R.layers.mask=$.layers.mask|4,M.layers.mask=T.layers.mask|R.layers.mask;const ot=$.parent,It=M.cameras;X(M,ot);for(let Ot=0;Ot<It.length;Ot++)X(It[Ot],ot);It.length===2?G(M,T,R):M.projectionMatrix.copy(T.projectionMatrix),tt($,M,ot)};function tt($,nt,dt){dt===null?$.matrix.copy(nt.matrixWorld):($.matrix.copy(dt.matrixWorld),$.matrix.invert(),$.matrix.multiply(nt.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(nt.projectionMatrix),$.projectionMatrixInverse.copy(nt.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Ec*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(u===null&&d===null))return c},this.setFoveation=function($){c=$,u!==null&&(u.fixedFoveation=$),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=$)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(M)};let st=null;function J($,nt){if(h=nt.getViewerPose(l||o),m=nt,h!==null){const dt=h.views;d!==null&&(t.setRenderTargetFramebuffer(_,d.framebuffer),t.setRenderTarget(_));let ot=!1;dt.length!==M.cameras.length&&(M.cameras.length=0,ot=!0);for(let Ot=0;Ot<dt.length;Ot++){const Dt=dt[Ot];let Xt=null;if(d!==null)Xt=d.getViewport(Dt);else{const lt=f.getViewSubImage(u,Dt);Xt=lt.viewport,Ot===0&&(t.setRenderTargetTextures(_,lt.colorTexture,u.ignoreDepthValues?void 0:lt.depthStencilTexture),t.setRenderTarget(_))}let et=S[Ot];et===void 0&&(et=new tn,et.layers.enable(Ot),et.viewport=new de,S[Ot]=et),et.matrix.fromArray(Dt.transform.matrix),et.matrix.decompose(et.position,et.quaternion,et.scale),et.projectionMatrix.fromArray(Dt.projectionMatrix),et.projectionMatrixInverse.copy(et.projectionMatrix).invert(),et.viewport.set(Xt.x,Xt.y,Xt.width,Xt.height),Ot===0&&(M.matrix.copy(et.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),ot===!0&&M.cameras.push(et)}const It=i.enabledFeatures;if(It&&It.includes("depth-sensing")){const Ot=f.getDepthInformation(dt[0]);Ot&&Ot.isValid&&Ot.texture&&v.init(t,Ot,i.renderState)}}for(let dt=0;dt<y.length;dt++){const ot=x[dt],It=y[dt];ot!==null&&It!==void 0&&It.update(ot,nt,l||o)}st&&st($,nt),nt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:nt}),m=null}const Nt=new ku;Nt.setAnimationLoop(J),this.setAnimationLoop=function($){st=$},this.dispose=function(){}}}const yi=new rn,wv=new Zt;function bv(s,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,Fu(s)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function i(g,p,_,y,x){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),f(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p)):p.isMeshStandardMaterial?(r(g,p),u(g,p),p.isMeshPhysicalMaterial&&d(g,p,x)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),v(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?c(g,p,_,y):p.isSpriteMaterial?l(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Ae&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Ae&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const _=t.get(p),y=_.envMap,x=_.envMapRotation;y&&(g.envMap.value=y,yi.copy(x),yi.x*=-1,yi.y*=-1,yi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(yi.y*=-1,yi.z*=-1),g.envMapRotation.value.setFromMatrix4(wv.makeRotationFromEuler(yi)),g.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function c(g,p,_,y){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*_,g.scale.value=y*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function l(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function f(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function u(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,_){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ae&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=_.texture,g.transmissionSamplerSize.value.set(_.width,_.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function v(g,p){const _=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(_.matrixWorld),g.nearDistance.value=_.shadow.camera.near,g.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Tv(s,t,e,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(_,y){const x=y.program;n.uniformBlockBinding(_,x)}function l(_,y){let x=i[_.id];x===void 0&&(m(_),x=h(_),i[_.id]=x,_.addEventListener("dispose",g));const C=y.program;n.updateUBOMapping(_,C);const w=t.render.frame;r[_.id]!==w&&(u(_),r[_.id]=w)}function h(_){const y=f();_.__bindingPointIndex=y;const x=s.createBuffer(),C=_.__size,w=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,x),s.bufferData(s.UNIFORM_BUFFER,C,w),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,y,x),x}function f(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(_){const y=i[_.id],x=_.uniforms,C=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,y);for(let w=0,T=x.length;w<T;w++){const R=Array.isArray(x[w])?x[w]:[x[w]];for(let S=0,M=R.length;S<M;S++){const P=R[S];if(d(P,w,S,C)===!0){const O=P.__offset,I=Array.isArray(P.value)?P.value:[P.value];let F=0;for(let z=0;z<I.length;z++){const D=I[z],Y=v(D);typeof D=="number"||typeof D=="boolean"?(P.__data[0]=D,s.bufferSubData(s.UNIFORM_BUFFER,O+F,P.__data)):D.isMatrix3?(P.__data[0]=D.elements[0],P.__data[1]=D.elements[1],P.__data[2]=D.elements[2],P.__data[3]=0,P.__data[4]=D.elements[3],P.__data[5]=D.elements[4],P.__data[6]=D.elements[5],P.__data[7]=0,P.__data[8]=D.elements[6],P.__data[9]=D.elements[7],P.__data[10]=D.elements[8],P.__data[11]=0):(D.toArray(P.__data,F),F+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,O,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(_,y,x,C){const w=_.value,T=y+"_"+x;if(C[T]===void 0)return typeof w=="number"||typeof w=="boolean"?C[T]=w:C[T]=w.clone(),!0;{const R=C[T];if(typeof w=="number"||typeof w=="boolean"){if(R!==w)return C[T]=w,!0}else if(R.equals(w)===!1)return R.copy(w),!0}return!1}function m(_){const y=_.uniforms;let x=0;const C=16;for(let T=0,R=y.length;T<R;T++){const S=Array.isArray(y[T])?y[T]:[y[T]];for(let M=0,P=S.length;M<P;M++){const O=S[M],I=Array.isArray(O.value)?O.value:[O.value];for(let F=0,z=I.length;F<z;F++){const D=I[F],Y=v(D),G=x%C,X=G%Y.boundary,tt=G+X;x+=X,tt!==0&&C-tt<Y.storage&&(x+=C-tt),O.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=x,x+=Y.storage}}}const w=x%C;return w>0&&(x+=C-w),_.__size=x,_.__cache={},this}function v(_){const y={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(y.boundary=4,y.storage=4):_.isVector2?(y.boundary=8,y.storage=8):_.isVector3||_.isColor?(y.boundary=16,y.storage=12):_.isVector4?(y.boundary=16,y.storage=16):_.isMatrix3?(y.boundary=48,y.storage=48):_.isMatrix4?(y.boundary=64,y.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),y}function g(_){const y=_.target;y.removeEventListener("dispose",g);const x=o.indexOf(y.__bindingPointIndex);o.splice(x,1),s.deleteBuffer(i[y.id]),delete i[y.id],delete r[y.id]}function p(){for(const _ in i)s.deleteBuffer(i[_]);o=[],i={},r={}}return{bind:c,update:l,dispose:p}}class Av{constructor(t={}){const{canvas:e=gd(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reverseDepthBuffer:u=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const m=new Uint32Array(4),v=new Int32Array(4);let g=null,p=null;const _=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ue,this.toneMapping=ui,this.toneMappingExposure=1;const x=this;let C=!1,w=0,T=0,R=null,S=-1,M=null;const P=new de,O=new de;let I=null;const F=new zt(0);let z=0,D=e.width,Y=e.height,G=1,X=null,tt=null;const st=new de(0,0,D,Y),J=new de(0,0,D,Y);let Nt=!1;const $=new Bu;let nt=!1,dt=!1;const ot=new Zt,It=new Zt,Ot=new U,Dt=new de,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let et=!1;function lt(){return R===null?G:1}let N=n;function Pt(A,k){return e.getContext(A,k)}try{const A={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Lc}`),e.addEventListener("webglcontextlost",Q,!1),e.addEventListener("webglcontextrestored",_t,!1),e.addEventListener("webglcontextcreationerror",gt,!1),N===null){const k="webgl2";if(N=Pt(k,A),N===null)throw Pt(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let rt,St,ut,Ut,yt,L,b,H,Z,it,K,Tt,pt,Mt,Yt,at,wt,Ft,Bt,bt,$t,Wt,ie,B;function mt(){rt=new Im(N),rt.init(),Wt=new vv(N,rt),St=new Tm(N,rt,t,Wt),ut=new pv(N,rt),St.reverseDepthBuffer&&u&&ut.buffers.depth.setReversed(!0),Ut=new Um(N),yt=new Qg,L=new gv(N,rt,ut,yt,St,Wt,Ut),b=new Cm(x),H=new Lm(x),Z=new Gd(N),ie=new wm(N,Z),it=new Nm(N,Z,Ut,ie),K=new zm(N,it,Z,Ut),Bt=new Fm(N,St,L),at=new Am(yt),Tt=new Jg(x,b,H,rt,St,ie,at),pt=new bv(x,yt),Mt=new ev,Yt=new av(rt),Ft=new Em(x,b,H,ut,K,d,c),wt=new fv(x,K,St),B=new Tv(N,Ut,St,ut),bt=new bm(N,rt,Ut),$t=new Dm(N,rt,Ut),Ut.programs=Tt.programs,x.capabilities=St,x.extensions=rt,x.properties=yt,x.renderLists=Mt,x.shadowMap=wt,x.state=ut,x.info=Ut}mt();const j=new Ev(x,N);this.xr=j,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const A=rt.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=rt.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(A){A!==void 0&&(G=A,this.setSize(D,Y,!1))},this.getSize=function(A){return A.set(D,Y)},this.setSize=function(A,k,W=!0){if(j.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}D=A,Y=k,e.width=Math.floor(A*G),e.height=Math.floor(k*G),W===!0&&(e.style.width=A+"px",e.style.height=k+"px"),this.setViewport(0,0,A,k)},this.getDrawingBufferSize=function(A){return A.set(D*G,Y*G).floor()},this.setDrawingBufferSize=function(A,k,W){D=A,Y=k,G=W,e.width=Math.floor(A*W),e.height=Math.floor(k*W),this.setViewport(0,0,A,k)},this.getCurrentViewport=function(A){return A.copy(P)},this.getViewport=function(A){return A.copy(st)},this.setViewport=function(A,k,W,q){A.isVector4?st.set(A.x,A.y,A.z,A.w):st.set(A,k,W,q),ut.viewport(P.copy(st).multiplyScalar(G).round())},this.getScissor=function(A){return A.copy(J)},this.setScissor=function(A,k,W,q){A.isVector4?J.set(A.x,A.y,A.z,A.w):J.set(A,k,W,q),ut.scissor(O.copy(J).multiplyScalar(G).round())},this.getScissorTest=function(){return Nt},this.setScissorTest=function(A){ut.setScissorTest(Nt=A)},this.setOpaqueSort=function(A){X=A},this.setTransparentSort=function(A){tt=A},this.getClearColor=function(A){return A.copy(Ft.getClearColor())},this.setClearColor=function(){Ft.setClearColor.apply(Ft,arguments)},this.getClearAlpha=function(){return Ft.getClearAlpha()},this.setClearAlpha=function(){Ft.setClearAlpha.apply(Ft,arguments)},this.clear=function(A=!0,k=!0,W=!0){let q=0;if(A){let V=!1;if(R!==null){const ht=R.texture.format;V=ht===zc||ht===Fc||ht===Uc}if(V){const ht=R.texture.type,vt=ht===An||ht===Di||ht===cr||ht===Ms||ht===Nc||ht===Dc,At=Ft.getClearColor(),Ct=Ft.getClearAlpha(),kt=At.r,Gt=At.g,Rt=At.b;vt?(m[0]=kt,m[1]=Gt,m[2]=Rt,m[3]=Ct,N.clearBufferuiv(N.COLOR,0,m)):(v[0]=kt,v[1]=Gt,v[2]=Rt,v[3]=Ct,N.clearBufferiv(N.COLOR,0,v))}else q|=N.COLOR_BUFFER_BIT}k&&(q|=N.DEPTH_BUFFER_BIT),W&&(q|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Q,!1),e.removeEventListener("webglcontextrestored",_t,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),Mt.dispose(),Yt.dispose(),yt.dispose(),b.dispose(),H.dispose(),K.dispose(),ie.dispose(),B.dispose(),Tt.dispose(),j.dispose(),j.removeEventListener("sessionstart",Jc),j.removeEventListener("sessionend",Qc),pi.stop()};function Q(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function _t(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const A=Ut.autoReset,k=wt.enabled,W=wt.autoUpdate,q=wt.needsUpdate,V=wt.type;mt(),Ut.autoReset=A,wt.enabled=k,wt.autoUpdate=W,wt.needsUpdate=q,wt.type=V}function gt(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Vt(A){const k=A.target;k.removeEventListener("dispose",Vt),ue(k)}function ue(A){Ce(A),yt.remove(A)}function Ce(A){const k=yt.get(A).programs;k!==void 0&&(k.forEach(function(W){Tt.releaseProgram(W)}),A.isShaderMaterial&&Tt.releaseShaderCache(A))}this.renderBufferDirect=function(A,k,W,q,V,ht){k===null&&(k=Xt);const vt=V.isMesh&&V.matrixWorld.determinant()<0,At=bf(A,k,W,q,V);ut.setMaterial(q,vt);let Ct=W.index,kt=1;if(q.wireframe===!0){if(Ct=it.getWireframeAttribute(W),Ct===void 0)return;kt=2}const Gt=W.drawRange,Rt=W.attributes.position;let Kt=Gt.start*kt,se=(Gt.start+Gt.count)*kt;ht!==null&&(Kt=Math.max(Kt,ht.start*kt),se=Math.min(se,(ht.start+ht.count)*kt)),Ct!==null?(Kt=Math.max(Kt,0),se=Math.min(se,Ct.count)):Rt!=null&&(Kt=Math.max(Kt,0),se=Math.min(se,Rt.count));const re=se-Kt;if(re<0||re===1/0)return;ie.setup(V,q,At,W,Ct);let Oe,Qt=bt;if(Ct!==null&&(Oe=Z.get(Ct),Qt=$t,Qt.setIndex(Oe)),V.isMesh)q.wireframe===!0?(ut.setLineWidth(q.wireframeLinewidth*lt()),Qt.setMode(N.LINES)):Qt.setMode(N.TRIANGLES);else if(V.isLine){let Lt=q.linewidth;Lt===void 0&&(Lt=1),ut.setLineWidth(Lt*lt()),V.isLineSegments?Qt.setMode(N.LINES):V.isLineLoop?Qt.setMode(N.LINE_LOOP):Qt.setMode(N.LINE_STRIP)}else V.isPoints?Qt.setMode(N.POINTS):V.isSprite&&Qt.setMode(N.TRIANGLES);if(V.isBatchedMesh)if(V._multiDrawInstances!==null)Qt.renderMultiDrawInstances(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount,V._multiDrawInstances);else if(rt.get("WEBGL_multi_draw"))Qt.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Lt=V._multiDrawStarts,Ln=V._multiDrawCounts,te=V._multiDrawCount,an=Ct?Z.get(Ct).bytesPerElement:1,Oi=yt.get(q).currentProgram.getUniforms();for(let He=0;He<te;He++)Oi.setValue(N,"_gl_DrawID",He),Qt.render(Lt[He]/an,Ln[He])}else if(V.isInstancedMesh)Qt.renderInstances(Kt,re,V.count);else if(W.isInstancedBufferGeometry){const Lt=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Ln=Math.min(W.instanceCount,Lt);Qt.renderInstances(Kt,re,Ln)}else Qt.render(Kt,re)};function ee(A,k,W){A.transparent===!0&&A.side===pn&&A.forceSinglePass===!1?(A.side=Ae,A.needsUpdate=!0,yr(A,k,W),A.side=Yn,A.needsUpdate=!0,yr(A,k,W),A.side=pn):yr(A,k,W)}this.compile=function(A,k,W=null){W===null&&(W=A),p=Yt.get(W),p.init(k),y.push(p),W.traverseVisible(function(V){V.isLight&&V.layers.test(k.layers)&&(p.pushLight(V),V.castShadow&&p.pushShadow(V))}),A!==W&&A.traverseVisible(function(V){V.isLight&&V.layers.test(k.layers)&&(p.pushLight(V),V.castShadow&&p.pushShadow(V))}),p.setupLights();const q=new Set;return A.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const ht=V.material;if(ht)if(Array.isArray(ht))for(let vt=0;vt<ht.length;vt++){const At=ht[vt];ee(At,W,V),q.add(At)}else ee(ht,W,V),q.add(ht)}),y.pop(),p=null,q},this.compileAsync=function(A,k,W=null){const q=this.compile(A,k,W);return new Promise(V=>{function ht(){if(q.forEach(function(vt){yt.get(vt).currentProgram.isReady()&&q.delete(vt)}),q.size===0){V(A);return}setTimeout(ht,10)}rt.get("KHR_parallel_shader_compile")!==null?ht():setTimeout(ht,10)})};let on=null;function Pn(A){on&&on(A)}function Jc(){pi.stop()}function Qc(){pi.start()}const pi=new ku;pi.setAnimationLoop(Pn),typeof self<"u"&&pi.setContext(self),this.setAnimationLoop=function(A){on=A,j.setAnimationLoop(A),A===null?pi.stop():pi.start()},j.addEventListener("sessionstart",Jc),j.addEventListener("sessionend",Qc),this.render=function(A,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),j.enabled===!0&&j.isPresenting===!0&&(j.cameraAutoUpdate===!0&&j.updateCamera(k),k=j.getCamera()),A.isScene===!0&&A.onBeforeRender(x,A,k,R),p=Yt.get(A,y.length),p.init(k),y.push(p),It.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),$.setFromProjectionMatrix(It),dt=this.localClippingEnabled,nt=at.init(this.clippingPlanes,dt),g=Mt.get(A,_.length),g.init(),_.push(g),j.enabled===!0&&j.isPresenting===!0){const ht=x.xr.getDepthSensingMesh();ht!==null&&Bo(ht,k,-1/0,x.sortObjects)}Bo(A,k,0,x.sortObjects),g.finish(),x.sortObjects===!0&&g.sort(X,tt),et=j.enabled===!1||j.isPresenting===!1||j.hasDepthSensing()===!1,et&&Ft.addToRenderList(g,A),this.info.render.frame++,nt===!0&&at.beginShadows();const W=p.state.shadowsArray;wt.render(W,A,k),nt===!0&&at.endShadows(),this.info.autoReset===!0&&this.info.reset();const q=g.opaque,V=g.transmissive;if(p.setupLights(),k.isArrayCamera){const ht=k.cameras;if(V.length>0)for(let vt=0,At=ht.length;vt<At;vt++){const Ct=ht[vt];el(q,V,A,Ct)}et&&Ft.render(A);for(let vt=0,At=ht.length;vt<At;vt++){const Ct=ht[vt];tl(g,A,Ct,Ct.viewport)}}else V.length>0&&el(q,V,A,k),et&&Ft.render(A),tl(g,A,k);R!==null&&(L.updateMultisampleRenderTarget(R),L.updateRenderTargetMipmap(R)),A.isScene===!0&&A.onAfterRender(x,A,k),ie.resetDefaultState(),S=-1,M=null,y.pop(),y.length>0?(p=y[y.length-1],nt===!0&&at.setGlobalState(x.clippingPlanes,p.state.camera)):p=null,_.pop(),_.length>0?g=_[_.length-1]:g=null};function Bo(A,k,W,q){if(A.visible===!1)return;if(A.layers.test(k.layers)){if(A.isGroup)W=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(k);else if(A.isLight)p.pushLight(A),A.castShadow&&p.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||$.intersectsSprite(A)){q&&Dt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(It);const vt=K.update(A),At=A.material;At.visible&&g.push(A,vt,At,W,Dt.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||$.intersectsObject(A))){const vt=K.update(A),At=A.material;if(q&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Dt.copy(A.boundingSphere.center)):(vt.boundingSphere===null&&vt.computeBoundingSphere(),Dt.copy(vt.boundingSphere.center)),Dt.applyMatrix4(A.matrixWorld).applyMatrix4(It)),Array.isArray(At)){const Ct=vt.groups;for(let kt=0,Gt=Ct.length;kt<Gt;kt++){const Rt=Ct[kt],Kt=At[Rt.materialIndex];Kt&&Kt.visible&&g.push(A,vt,Kt,W,Dt.z,Rt)}}else At.visible&&g.push(A,vt,At,W,Dt.z,null)}}const ht=A.children;for(let vt=0,At=ht.length;vt<At;vt++)Bo(ht[vt],k,W,q)}function tl(A,k,W,q){const V=A.opaque,ht=A.transmissive,vt=A.transparent;p.setupLightsView(W),nt===!0&&at.setGlobalState(x.clippingPlanes,W),q&&ut.viewport(P.copy(q)),V.length>0&&xr(V,k,W),ht.length>0&&xr(ht,k,W),vt.length>0&&xr(vt,k,W),ut.buffers.depth.setTest(!0),ut.buffers.depth.setMask(!0),ut.buffers.color.setMask(!0),ut.setPolygonOffset(!1)}function el(A,k,W,q){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[q.id]===void 0&&(p.state.transmissionRenderTarget[q.id]=new $n(1,1,{generateMipmaps:!0,type:rt.has("EXT_color_buffer_half_float")||rt.has("EXT_color_buffer_float")?Rs:An,minFilter:Pi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:jt.workingColorSpace}));const ht=p.state.transmissionRenderTarget[q.id],vt=q.viewport||P;ht.setSize(vt.z,vt.w);const At=x.getRenderTarget();x.setRenderTarget(ht),x.getClearColor(F),z=x.getClearAlpha(),z<1&&x.setClearColor(16777215,.5),x.clear(),et&&Ft.render(W);const Ct=x.toneMapping;x.toneMapping=ui;const kt=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),p.setupLightsView(q),nt===!0&&at.setGlobalState(x.clippingPlanes,q),xr(A,W,q),L.updateMultisampleRenderTarget(ht),L.updateRenderTargetMipmap(ht),rt.has("WEBGL_multisampled_render_to_texture")===!1){let Gt=!1;for(let Rt=0,Kt=k.length;Rt<Kt;Rt++){const se=k[Rt],re=se.object,Oe=se.geometry,Qt=se.material,Lt=se.group;if(Qt.side===pn&&re.layers.test(q.layers)){const Ln=Qt.side;Qt.side=Ae,Qt.needsUpdate=!0,nl(re,W,q,Oe,Qt,Lt),Qt.side=Ln,Qt.needsUpdate=!0,Gt=!0}}Gt===!0&&(L.updateMultisampleRenderTarget(ht),L.updateRenderTargetMipmap(ht))}x.setRenderTarget(At),x.setClearColor(F,z),kt!==void 0&&(q.viewport=kt),x.toneMapping=Ct}function xr(A,k,W){const q=k.isScene===!0?k.overrideMaterial:null;for(let V=0,ht=A.length;V<ht;V++){const vt=A[V],At=vt.object,Ct=vt.geometry,kt=q===null?vt.material:q,Gt=vt.group;At.layers.test(W.layers)&&nl(At,k,W,Ct,kt,Gt)}}function nl(A,k,W,q,V,ht){A.onBeforeRender(x,k,W,q,V,ht),A.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),V.onBeforeRender(x,k,W,q,A,ht),V.transparent===!0&&V.side===pn&&V.forceSinglePass===!1?(V.side=Ae,V.needsUpdate=!0,x.renderBufferDirect(W,k,q,V,A,ht),V.side=Yn,V.needsUpdate=!0,x.renderBufferDirect(W,k,q,V,A,ht),V.side=pn):x.renderBufferDirect(W,k,q,V,A,ht),A.onAfterRender(x,k,W,q,V,ht)}function yr(A,k,W){k.isScene!==!0&&(k=Xt);const q=yt.get(A),V=p.state.lights,ht=p.state.shadowsArray,vt=V.state.version,At=Tt.getParameters(A,V.state,ht,k,W),Ct=Tt.getProgramCacheKey(At);let kt=q.programs;q.environment=A.isMeshStandardMaterial?k.environment:null,q.fog=k.fog,q.envMap=(A.isMeshStandardMaterial?H:b).get(A.envMap||q.environment),q.envMapRotation=q.environment!==null&&A.envMap===null?k.environmentRotation:A.envMapRotation,kt===void 0&&(A.addEventListener("dispose",Vt),kt=new Map,q.programs=kt);let Gt=kt.get(Ct);if(Gt!==void 0){if(q.currentProgram===Gt&&q.lightsStateVersion===vt)return sl(A,At),Gt}else At.uniforms=Tt.getUniforms(A),A.onBeforeCompile(At,x),Gt=Tt.acquireProgram(At,Ct),kt.set(Ct,Gt),q.uniforms=At.uniforms;const Rt=q.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Rt.clippingPlanes=at.uniform),sl(A,At),q.needsLights=Af(A),q.lightsStateVersion=vt,q.needsLights&&(Rt.ambientLightColor.value=V.state.ambient,Rt.lightProbe.value=V.state.probe,Rt.directionalLights.value=V.state.directional,Rt.directionalLightShadows.value=V.state.directionalShadow,Rt.spotLights.value=V.state.spot,Rt.spotLightShadows.value=V.state.spotShadow,Rt.rectAreaLights.value=V.state.rectArea,Rt.ltc_1.value=V.state.rectAreaLTC1,Rt.ltc_2.value=V.state.rectAreaLTC2,Rt.pointLights.value=V.state.point,Rt.pointLightShadows.value=V.state.pointShadow,Rt.hemisphereLights.value=V.state.hemi,Rt.directionalShadowMap.value=V.state.directionalShadowMap,Rt.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Rt.spotShadowMap.value=V.state.spotShadowMap,Rt.spotLightMatrix.value=V.state.spotLightMatrix,Rt.spotLightMap.value=V.state.spotLightMap,Rt.pointShadowMap.value=V.state.pointShadowMap,Rt.pointShadowMatrix.value=V.state.pointShadowMatrix),q.currentProgram=Gt,q.uniformsList=null,Gt}function il(A){if(A.uniformsList===null){const k=A.currentProgram.getUniforms();A.uniformsList=vo.seqWithValue(k.seq,A.uniforms)}return A.uniformsList}function sl(A,k){const W=yt.get(A);W.outputColorSpace=k.outputColorSpace,W.batching=k.batching,W.batchingColor=k.batchingColor,W.instancing=k.instancing,W.instancingColor=k.instancingColor,W.instancingMorph=k.instancingMorph,W.skinning=k.skinning,W.morphTargets=k.morphTargets,W.morphNormals=k.morphNormals,W.morphColors=k.morphColors,W.morphTargetsCount=k.morphTargetsCount,W.numClippingPlanes=k.numClippingPlanes,W.numIntersection=k.numClipIntersection,W.vertexAlphas=k.vertexAlphas,W.vertexTangents=k.vertexTangents,W.toneMapping=k.toneMapping}function bf(A,k,W,q,V){k.isScene!==!0&&(k=Xt),L.resetTextureUnits();const ht=k.fog,vt=q.isMeshStandardMaterial?k.environment:null,At=R===null?x.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:Ps,Ct=(q.isMeshStandardMaterial?H:b).get(q.envMap||vt),kt=q.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Gt=!!W.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Rt=!!W.morphAttributes.position,Kt=!!W.morphAttributes.normal,se=!!W.morphAttributes.color;let re=ui;q.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(re=x.toneMapping);const Oe=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Qt=Oe!==void 0?Oe.length:0,Lt=yt.get(q),Ln=p.state.lights;if(nt===!0&&(dt===!0||A!==M)){const Ze=A===M&&q.id===S;at.setState(q,A,Ze)}let te=!1;q.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==Ln.state.version||Lt.outputColorSpace!==At||V.isBatchedMesh&&Lt.batching===!1||!V.isBatchedMesh&&Lt.batching===!0||V.isBatchedMesh&&Lt.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&Lt.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&Lt.instancing===!1||!V.isInstancedMesh&&Lt.instancing===!0||V.isSkinnedMesh&&Lt.skinning===!1||!V.isSkinnedMesh&&Lt.skinning===!0||V.isInstancedMesh&&Lt.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Lt.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Lt.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Lt.instancingMorph===!1&&V.morphTexture!==null||Lt.envMap!==Ct||q.fog===!0&&Lt.fog!==ht||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==at.numPlanes||Lt.numIntersection!==at.numIntersection)||Lt.vertexAlphas!==kt||Lt.vertexTangents!==Gt||Lt.morphTargets!==Rt||Lt.morphNormals!==Kt||Lt.morphColors!==se||Lt.toneMapping!==re||Lt.morphTargetsCount!==Qt)&&(te=!0):(te=!0,Lt.__version=q.version);let an=Lt.currentProgram;te===!0&&(an=yr(q,k,V));let Oi=!1,He=!1,Os=!1;const oe=an.getUniforms(),vn=Lt.uniforms;if(ut.useProgram(an.program)&&(Oi=!0,He=!0,Os=!0),q.id!==S&&(S=q.id,He=!0),Oi||M!==A){ut.buffers.depth.getReversed()?(ot.copy(A.projectionMatrix),_d(ot),xd(ot),oe.setValue(N,"projectionMatrix",ot)):oe.setValue(N,"projectionMatrix",A.projectionMatrix),oe.setValue(N,"viewMatrix",A.matrixWorldInverse);const jn=oe.map.cameraPosition;jn!==void 0&&jn.setValue(N,Ot.setFromMatrixPosition(A.matrixWorld)),St.logarithmicDepthBuffer&&oe.setValue(N,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&oe.setValue(N,"isOrthographic",A.isOrthographicCamera===!0),M!==A&&(M=A,He=!0,Os=!0)}if(V.isSkinnedMesh){oe.setOptional(N,V,"bindMatrix"),oe.setOptional(N,V,"bindMatrixInverse");const Ze=V.skeleton;Ze&&(Ze.boneTexture===null&&Ze.computeBoneTexture(),oe.setValue(N,"boneTexture",Ze.boneTexture,L))}V.isBatchedMesh&&(oe.setOptional(N,V,"batchingTexture"),oe.setValue(N,"batchingTexture",V._matricesTexture,L),oe.setOptional(N,V,"batchingIdTexture"),oe.setValue(N,"batchingIdTexture",V._indirectTexture,L),oe.setOptional(N,V,"batchingColorTexture"),V._colorsTexture!==null&&oe.setValue(N,"batchingColorTexture",V._colorsTexture,L));const Bs=W.morphAttributes;if((Bs.position!==void 0||Bs.normal!==void 0||Bs.color!==void 0)&&Bt.update(V,W,an),(He||Lt.receiveShadow!==V.receiveShadow)&&(Lt.receiveShadow=V.receiveShadow,oe.setValue(N,"receiveShadow",V.receiveShadow)),q.isMeshGouraudMaterial&&q.envMap!==null&&(vn.envMap.value=Ct,vn.flipEnvMap.value=Ct.isCubeTexture&&Ct.isRenderTargetTexture===!1?-1:1),q.isMeshStandardMaterial&&q.envMap===null&&k.environment!==null&&(vn.envMapIntensity.value=k.environmentIntensity),He&&(oe.setValue(N,"toneMappingExposure",x.toneMappingExposure),Lt.needsLights&&Tf(vn,Os),ht&&q.fog===!0&&pt.refreshFogUniforms(vn,ht),pt.refreshMaterialUniforms(vn,q,G,Y,p.state.transmissionRenderTarget[A.id]),vo.upload(N,il(Lt),vn,L)),q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(vo.upload(N,il(Lt),vn,L),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&oe.setValue(N,"center",V.center),oe.setValue(N,"modelViewMatrix",V.modelViewMatrix),oe.setValue(N,"normalMatrix",V.normalMatrix),oe.setValue(N,"modelMatrix",V.matrixWorld),q.isShaderMaterial||q.isRawShaderMaterial){const Ze=q.uniformsGroups;for(let jn=0,Zn=Ze.length;jn<Zn;jn++){const rl=Ze[jn];B.update(rl,an),B.bind(rl,an)}}return an}function Tf(A,k){A.ambientLightColor.needsUpdate=k,A.lightProbe.needsUpdate=k,A.directionalLights.needsUpdate=k,A.directionalLightShadows.needsUpdate=k,A.pointLights.needsUpdate=k,A.pointLightShadows.needsUpdate=k,A.spotLights.needsUpdate=k,A.spotLightShadows.needsUpdate=k,A.rectAreaLights.needsUpdate=k,A.hemisphereLights.needsUpdate=k}function Af(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(A,k,W){yt.get(A.texture).__webglTexture=k,yt.get(A.depthTexture).__webglTexture=W;const q=yt.get(A);q.__hasExternalTextures=!0,q.__autoAllocateDepthBuffer=W===void 0,q.__autoAllocateDepthBuffer||rt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),q.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,k){const W=yt.get(A);W.__webglFramebuffer=k,W.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(A,k=0,W=0){R=A,w=k,T=W;let q=!0,V=null,ht=!1,vt=!1;if(A){const Ct=yt.get(A);if(Ct.__useDefaultFramebuffer!==void 0)ut.bindFramebuffer(N.FRAMEBUFFER,null),q=!1;else if(Ct.__webglFramebuffer===void 0)L.setupRenderTarget(A);else if(Ct.__hasExternalTextures)L.rebindTextures(A,yt.get(A.texture).__webglTexture,yt.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const Rt=A.depthTexture;if(Ct.__boundDepthTexture!==Rt){if(Rt!==null&&yt.has(Rt)&&(A.width!==Rt.image.width||A.height!==Rt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");L.setupDepthRenderbuffer(A)}}const kt=A.texture;(kt.isData3DTexture||kt.isDataArrayTexture||kt.isCompressedArrayTexture)&&(vt=!0);const Gt=yt.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Gt[k])?V=Gt[k][W]:V=Gt[k],ht=!0):A.samples>0&&L.useMultisampledRTT(A)===!1?V=yt.get(A).__webglMultisampledFramebuffer:Array.isArray(Gt)?V=Gt[W]:V=Gt,P.copy(A.viewport),O.copy(A.scissor),I=A.scissorTest}else P.copy(st).multiplyScalar(G).floor(),O.copy(J).multiplyScalar(G).floor(),I=Nt;if(ut.bindFramebuffer(N.FRAMEBUFFER,V)&&q&&ut.drawBuffers(A,V),ut.viewport(P),ut.scissor(O),ut.setScissorTest(I),ht){const Ct=yt.get(A.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+k,Ct.__webglTexture,W)}else if(vt){const Ct=yt.get(A.texture),kt=k||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ct.__webglTexture,W||0,kt)}S=-1},this.readRenderTargetPixels=function(A,k,W,q,V,ht,vt){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let At=yt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&vt!==void 0&&(At=At[vt]),At){ut.bindFramebuffer(N.FRAMEBUFFER,At);try{const Ct=A.texture,kt=Ct.format,Gt=Ct.type;if(!St.textureFormatReadable(kt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!St.textureTypeReadable(Gt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=A.width-q&&W>=0&&W<=A.height-V&&N.readPixels(k,W,q,V,Wt.convert(kt),Wt.convert(Gt),ht)}finally{const Ct=R!==null?yt.get(R).__webglFramebuffer:null;ut.bindFramebuffer(N.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(A,k,W,q,V,ht,vt){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let At=yt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&vt!==void 0&&(At=At[vt]),At){const Ct=A.texture,kt=Ct.format,Gt=Ct.type;if(!St.textureFormatReadable(kt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!St.textureTypeReadable(Gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=A.width-q&&W>=0&&W<=A.height-V){ut.bindFramebuffer(N.FRAMEBUFFER,At);const Rt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Rt),N.bufferData(N.PIXEL_PACK_BUFFER,ht.byteLength,N.STREAM_READ),N.readPixels(k,W,q,V,Wt.convert(kt),Wt.convert(Gt),0);const Kt=R!==null?yt.get(R).__webglFramebuffer:null;ut.bindFramebuffer(N.FRAMEBUFFER,Kt);const se=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await vd(N,se,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Rt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ht),N.deleteBuffer(Rt),N.deleteSync(se),ht}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(A,k=null,W=0){A.isTexture!==!0&&(tr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,A=arguments[1]);const q=Math.pow(2,-W),V=Math.floor(A.image.width*q),ht=Math.floor(A.image.height*q),vt=k!==null?k.x:0,At=k!==null?k.y:0;L.setTexture2D(A,0),N.copyTexSubImage2D(N.TEXTURE_2D,W,0,0,vt,At,V,ht),ut.unbindTexture()},this.copyTextureToTexture=function(A,k,W=null,q=null,V=0){A.isTexture!==!0&&(tr("WebGLRenderer: copyTextureToTexture function signature has changed."),q=arguments[0]||null,A=arguments[1],k=arguments[2],V=arguments[3]||0,W=null);let ht,vt,At,Ct,kt,Gt,Rt,Kt,se;const re=A.isCompressedTexture?A.mipmaps[V]:A.image;W!==null?(ht=W.max.x-W.min.x,vt=W.max.y-W.min.y,At=W.isBox3?W.max.z-W.min.z:1,Ct=W.min.x,kt=W.min.y,Gt=W.isBox3?W.min.z:0):(ht=re.width,vt=re.height,At=re.depth||1,Ct=0,kt=0,Gt=0),q!==null?(Rt=q.x,Kt=q.y,se=q.z):(Rt=0,Kt=0,se=0);const Oe=Wt.convert(k.format),Qt=Wt.convert(k.type);let Lt;k.isData3DTexture?(L.setTexture3D(k,0),Lt=N.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(L.setTexture2DArray(k,0),Lt=N.TEXTURE_2D_ARRAY):(L.setTexture2D(k,0),Lt=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,k.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,k.unpackAlignment);const Ln=N.getParameter(N.UNPACK_ROW_LENGTH),te=N.getParameter(N.UNPACK_IMAGE_HEIGHT),an=N.getParameter(N.UNPACK_SKIP_PIXELS),Oi=N.getParameter(N.UNPACK_SKIP_ROWS),He=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,re.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,re.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Ct),N.pixelStorei(N.UNPACK_SKIP_ROWS,kt),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Gt);const Os=A.isDataArrayTexture||A.isData3DTexture,oe=k.isDataArrayTexture||k.isData3DTexture;if(A.isRenderTargetTexture||A.isDepthTexture){const vn=yt.get(A),Bs=yt.get(k),Ze=yt.get(vn.__renderTarget),jn=yt.get(Bs.__renderTarget);ut.bindFramebuffer(N.READ_FRAMEBUFFER,Ze.__webglFramebuffer),ut.bindFramebuffer(N.DRAW_FRAMEBUFFER,jn.__webglFramebuffer);for(let Zn=0;Zn<At;Zn++)Os&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,yt.get(A).__webglTexture,V,Gt+Zn),A.isDepthTexture?(oe&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,yt.get(k).__webglTexture,V,se+Zn),N.blitFramebuffer(Ct,kt,ht,vt,Rt,Kt,ht,vt,N.DEPTH_BUFFER_BIT,N.NEAREST)):oe?N.copyTexSubImage3D(Lt,V,Rt,Kt,se+Zn,Ct,kt,ht,vt):N.copyTexSubImage2D(Lt,V,Rt,Kt,se+Zn,Ct,kt,ht,vt);ut.bindFramebuffer(N.READ_FRAMEBUFFER,null),ut.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else oe?A.isDataTexture||A.isData3DTexture?N.texSubImage3D(Lt,V,Rt,Kt,se,ht,vt,At,Oe,Qt,re.data):k.isCompressedArrayTexture?N.compressedTexSubImage3D(Lt,V,Rt,Kt,se,ht,vt,At,Oe,re.data):N.texSubImage3D(Lt,V,Rt,Kt,se,ht,vt,At,Oe,Qt,re):A.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,V,Rt,Kt,ht,vt,Oe,Qt,re.data):A.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,V,Rt,Kt,re.width,re.height,Oe,re.data):N.texSubImage2D(N.TEXTURE_2D,V,Rt,Kt,ht,vt,Oe,Qt,re);N.pixelStorei(N.UNPACK_ROW_LENGTH,Ln),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,te),N.pixelStorei(N.UNPACK_SKIP_PIXELS,an),N.pixelStorei(N.UNPACK_SKIP_ROWS,Oi),N.pixelStorei(N.UNPACK_SKIP_IMAGES,He),V===0&&k.generateMipmaps&&N.generateMipmap(Lt),ut.unbindTexture()},this.copyTextureToTexture3D=function(A,k,W=null,q=null,V=0){return A.isTexture!==!0&&(tr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),W=arguments[0]||null,q=arguments[1]||null,A=arguments[2],k=arguments[3],V=arguments[4]||0),tr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,k,W,q,V)},this.initRenderTarget=function(A){yt.get(A).__webglFramebuffer===void 0&&L.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?L.setTextureCube(A,0):A.isData3DTexture?L.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?L.setTexture2DArray(A,0):L.setTexture2D(A,0),ut.unbindTexture()},this.resetState=function(){w=0,T=0,R=null,ut.reset(),ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=jt._getDrawingBufferColorSpace(t),e.unpackColorSpace=jt._getUnpackColorSpace()}}class kc{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new zt(t),this.density=e}clone(){return new kc(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Cv extends Ge{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new rn,this.environmentIntensity=1,this.environmentRotation=new rn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Rv extends ze{constructor(t=null,e=1,n=1,i,r,o,a,c,l=$e,h=$e,f,u){super(null,o,a,c,l,h,i,r,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Pv extends xe{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}class Rn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const r=n.length;let o;e?o=e:o=t*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(i=Math.floor(a+(c-a)/2),l=n[i]-o,l<0)a=i+1;else if(l>0)c=i-1;else{c=i;break}if(i=c,n[i]===o)return i/(r-1);const h=n[i],u=n[i+1]-h,d=(o-h)/u;return(i+d)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const o=this.getPoint(i),a=this.getPoint(r),c=e||(o.isVector2?new ct:new U);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new U,i=[],r=[],o=[],a=new U,c=new Zt;for(let d=0;d<=t;d++){const m=d/t;i[d]=this.getTangentAt(m,new U)}r[0]=new U,o[0]=new U;let l=Number.MAX_VALUE;const h=Math.abs(i[0].x),f=Math.abs(i[0].y),u=Math.abs(i[0].z);h<=l&&(l=h,n.set(1,0,0)),f<=l&&(l=f,n.set(0,1,0)),u<=l&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(i[d-1],i[d]),a.length()>Number.EPSILON){a.normalize();const m=Math.acos(Le(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(a,m))}o[d].crossVectors(i[d],r[d])}if(e===!0){let d=Math.acos(Le(r[0].dot(r[t]),-1,1));d/=t,i[0].dot(a.crossVectors(r[0],r[t]))>0&&(d=-d);for(let m=1;m<=t;m++)r[m].applyMatrix4(c.makeRotationAxis(i[m],d*m)),o[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Vc extends Rn{constructor(t=0,e=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new ct){const n=e,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);const a=this.aStartAngle+t*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),f=Math.sin(this.aRotation),u=c-this.aX,d=l-this.aY;c=u*h-d*f+this.aX,l=u*f+d*h+this.aY}return n.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class Lv extends Vc{constructor(t,e,n,i,r,o){super(t,e,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Gc(){let s=0,t=0,e=0,n=0;function i(r,o,a,c){s=r,t=a,e=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){i(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,f){let u=(o-r)/l-(a-r)/(l+h)+(a-o)/h,d=(a-o)/h-(c-o)/(h+f)+(c-a)/f;u*=h,d*=h,i(o,a,u,d)},calc:function(r){const o=r*r,a=o*r;return s+t*r+e*o+n*a}}}const Gr=new U,ga=new Gc,va=new Gc,_a=new Gc;class Iv extends Rn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new U){const n=e,i=this.points,r=i.length,o=(r-(this.closed?0:1))*t;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=i[(a-1)%r]:(Gr.subVectors(i[0],i[1]).add(i[0]),l=Gr);const f=i[a%r],u=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(Gr.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Gr),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let m=Math.pow(l.distanceToSquared(f),d),v=Math.pow(f.distanceToSquared(u),d),g=Math.pow(u.distanceToSquared(h),d);v<1e-4&&(v=1),m<1e-4&&(m=v),g<1e-4&&(g=v),ga.initNonuniformCatmullRom(l.x,f.x,u.x,h.x,m,v,g),va.initNonuniformCatmullRom(l.y,f.y,u.y,h.y,m,v,g),_a.initNonuniformCatmullRom(l.z,f.z,u.z,h.z,m,v,g)}else this.curveType==="catmullrom"&&(ga.initCatmullRom(l.x,f.x,u.x,h.x,this.tension),va.initCatmullRom(l.y,f.y,u.y,h.y,this.tension),_a.initCatmullRom(l.z,f.z,u.z,h.z,this.tension));return n.set(ga.calc(c),va.calc(c),_a.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new U().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function ih(s,t,e,n,i){const r=(n-t)*.5,o=(i-e)*.5,a=s*s,c=s*a;return(2*e-2*n+r+o)*c+(-3*e+3*n-2*r-o)*a+r*s+e}function Nv(s,t){const e=1-s;return e*e*t}function Dv(s,t){return 2*(1-s)*s*t}function Uv(s,t){return s*s*t}function nr(s,t,e,n){return Nv(s,t)+Dv(s,e)+Uv(s,n)}function Fv(s,t){const e=1-s;return e*e*e*t}function zv(s,t){const e=1-s;return 3*e*e*s*t}function Ov(s,t){return 3*(1-s)*s*s*t}function Bv(s,t){return s*s*s*t}function ir(s,t,e,n,i){return Fv(s,t)+zv(s,e)+Ov(s,n)+Bv(s,i)}class Yu extends Rn{constructor(t=new ct,e=new ct,n=new ct,i=new ct){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new ct){const n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ir(t,i.x,r.x,o.x,a.x),ir(t,i.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class kv extends Rn{constructor(t=new U,e=new U,n=new U,i=new U){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new U){const n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ir(t,i.x,r.x,o.x,a.x),ir(t,i.y,r.y,o.y,a.y),ir(t,i.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class $u extends Rn{constructor(t=new ct,e=new ct){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ct){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ct){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Vv extends Rn{constructor(t=new U,e=new U){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new U){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new U){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class ju extends Rn{constructor(t=new ct,e=new ct,n=new ct){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ct){const n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(nr(t,i.x,r.x,o.x),nr(t,i.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Gv extends Rn{constructor(t=new U,e=new U,n=new U){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new U){const n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(nr(t,i.x,r.x,o.x),nr(t,i.y,r.y,o.y),nr(t,i.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class Zu extends Rn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ct){const n=e,i=this.points,r=(i.length-1)*t,o=Math.floor(r),a=r-o,c=i[o===0?o:o-1],l=i[o],h=i[o>i.length-2?i.length-1:o+1],f=i[o>i.length-3?i.length-1:o+2];return n.set(ih(a,c.x,l.x,h.x,f.x),ih(a,c.y,l.y,h.y,f.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new ct().fromArray(i))}return this}}var bc=Object.freeze({__proto__:null,ArcCurve:Lv,CatmullRomCurve3:Iv,CubicBezierCurve:Yu,CubicBezierCurve3:kv,EllipseCurve:Vc,LineCurve:$u,LineCurve3:Vv,QuadraticBezierCurve:ju,QuadraticBezierCurve3:Gv,SplineCurve:Zu});class Hv extends Rn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new bc[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const o=i[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const o=r[i],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){const h=c[l];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new bc[i.type]().fromJSON(i))}return this}}class sh extends Hv{constructor(t){super(),this.type="Path",this.currentPoint=new ct,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new $u(this.currentPoint.clone(),new ct(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const r=new ju(this.currentPoint.clone(),new ct(t,e),new ct(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,o){const a=new Yu(this.currentPoint.clone(),new ct(t,e),new ct(n,i),new ct(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new Zu(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,n,i,r,o),this}absarc(t,e,n,i,r,o){return this.absellipse(t,e,n,n,i,r,o),this}ellipse(t,e,n,i,r,o,a,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,n,i,r,o,a,c),this}absellipse(t,e,n,i,r,o,a,c){const l=new Vc(t,e,n,i,r,o,a,c);if(this.curves.length>0){const f=l.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class Hc extends be{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);const r=[],o=[],a=[],c=[],l=new U,h=new ct;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let f=0,u=3;f<=e;f++,u+=3){const d=n+f/e*i;l.x=t*Math.cos(d),l.y=t*Math.sin(d),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[u]/t+1)/2,h.y=(o[u+1]/t+1)/2,c.push(h.x,h.y)}for(let f=1;f<=e;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new le(o,3)),this.setAttribute("normal",new le(a,3)),this.setAttribute("uv",new le(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Hc(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class ws extends be{constructor(t=1,e=1,n=1,i=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;i=Math.floor(i),r=Math.floor(r);const h=[],f=[],u=[],d=[];let m=0;const v=[],g=n/2;let p=0;_(),o===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new le(f,3)),this.setAttribute("normal",new le(u,3)),this.setAttribute("uv",new le(d,2));function _(){const x=new U,C=new U;let w=0;const T=(e-t)/n;for(let R=0;R<=r;R++){const S=[],M=R/r,P=M*(e-t)+t;for(let O=0;O<=i;O++){const I=O/i,F=I*c+a,z=Math.sin(F),D=Math.cos(F);C.x=P*z,C.y=-M*n+g,C.z=P*D,f.push(C.x,C.y,C.z),x.set(z,T,D).normalize(),u.push(x.x,x.y,x.z),d.push(I,1-M),S.push(m++)}v.push(S)}for(let R=0;R<i;R++)for(let S=0;S<r;S++){const M=v[S][R],P=v[S+1][R],O=v[S+1][R+1],I=v[S][R+1];(t>0||S!==0)&&(h.push(M,P,I),w+=3),(e>0||S!==r-1)&&(h.push(P,O,I),w+=3)}l.addGroup(p,w,0),p+=w}function y(x){const C=m,w=new ct,T=new U;let R=0;const S=x===!0?t:e,M=x===!0?1:-1;for(let O=1;O<=i;O++)f.push(0,g*M,0),u.push(0,M,0),d.push(.5,.5),m++;const P=m;for(let O=0;O<=i;O++){const F=O/i*c+a,z=Math.cos(F),D=Math.sin(F);T.x=S*D,T.y=g*M,T.z=S*z,f.push(T.x,T.y,T.z),u.push(0,M,0),w.x=z*.5+.5,w.y=D*.5*M+.5,d.push(w.x,w.y),m++}for(let O=0;O<i;O++){const I=C+O,F=P+O;x===!0?h.push(F,F+1,I):h.push(F+1,F,I),R+=3}l.addGroup(p,R,x===!0?1:2),p+=R}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ws(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class lr extends ws{constructor(t=1,e=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new lr(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}let Ku=class extends sh{constructor(t){super(t),this.uuid=Is(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(new sh().fromJSON(i))}return this}};const Wv={triangulate:function(s,t,e=2){const n=t&&t.length,i=n?t[0]*e:s.length;let r=Ju(s,0,i,e,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l,h,f,u,d;if(n&&(r=jv(s,t,r,e)),s.length>80*e){a=l=s[0],c=h=s[1];for(let m=e;m<i;m+=e)f=s[m],u=s[m+1],f<a&&(a=f),u<c&&(c=u),f>l&&(l=f),u>h&&(h=u);d=Math.max(l-a,h-c),d=d!==0?32767/d:0}return hr(r,o,e,a,c,d,0),o}};function Ju(s,t,e,n,i){let r,o;if(i===o_(s,t,e,n)>0)for(r=t;r<e;r+=n)o=rh(r,s[r],s[r+1],o);else for(r=e-n;r>=t;r-=n)o=rh(r,s[r],s[r+1],o);return o&&No(o,o.next)&&(fr(o),o=o.next),o}function Ui(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(No(e,e.next)||he(e.prev,e,e.next)===0)){if(fr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function hr(s,t,e,n,i,r,o){if(!s)return;!o&&r&&t_(s,n,i,r);let a=s,c,l;for(;s.prev!==s.next;){if(c=s.prev,l=s.next,r?Xv(s,n,i,r):qv(s)){t.push(c.i/e|0),t.push(s.i/e|0),t.push(l.i/e|0),fr(s),s=l.next,a=l.next;continue}if(s=l,s===a){o?o===1?(s=Yv(Ui(s),t,e),hr(s,t,e,n,i,r,2)):o===2&&$v(s,t,e,n,i,r):hr(Ui(s),t,e,n,i,r,1);break}}}function qv(s){const t=s.prev,e=s,n=s.next;if(he(t,e,n)>=0)return!1;const i=t.x,r=e.x,o=n.x,a=t.y,c=e.y,l=n.y,h=i<r?i<o?i:o:r<o?r:o,f=a<c?a<l?a:l:c<l?c:l,u=i>r?i>o?i:o:r>o?r:o,d=a>c?a>l?a:l:c>l?c:l;let m=n.next;for(;m!==t;){if(m.x>=h&&m.x<=u&&m.y>=f&&m.y<=d&&hs(i,a,r,c,o,l,m.x,m.y)&&he(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Xv(s,t,e,n){const i=s.prev,r=s,o=s.next;if(he(i,r,o)>=0)return!1;const a=i.x,c=r.x,l=o.x,h=i.y,f=r.y,u=o.y,d=a<c?a<l?a:l:c<l?c:l,m=h<f?h<u?h:u:f<u?f:u,v=a>c?a>l?a:l:c>l?c:l,g=h>f?h>u?h:u:f>u?f:u,p=Tc(d,m,t,e,n),_=Tc(v,g,t,e,n);let y=s.prevZ,x=s.nextZ;for(;y&&y.z>=p&&x&&x.z<=_;){if(y.x>=d&&y.x<=v&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&hs(a,h,c,f,l,u,y.x,y.y)&&he(y.prev,y,y.next)>=0||(y=y.prevZ,x.x>=d&&x.x<=v&&x.y>=m&&x.y<=g&&x!==i&&x!==o&&hs(a,h,c,f,l,u,x.x,x.y)&&he(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;y&&y.z>=p;){if(y.x>=d&&y.x<=v&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&hs(a,h,c,f,l,u,y.x,y.y)&&he(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;x&&x.z<=_;){if(x.x>=d&&x.x<=v&&x.y>=m&&x.y<=g&&x!==i&&x!==o&&hs(a,h,c,f,l,u,x.x,x.y)&&he(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Yv(s,t,e){let n=s;do{const i=n.prev,r=n.next.next;!No(i,r)&&Qu(i,n,n.next,r)&&ur(i,r)&&ur(r,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),fr(n),fr(n.next),n=s=r),n=n.next}while(n!==s);return Ui(n)}function $v(s,t,e,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&i_(o,a)){let c=tf(o,a);o=Ui(o,o.next),c=Ui(c,c.next),hr(o,t,e,n,i,r,0),hr(c,t,e,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function jv(s,t,e,n){const i=[];let r,o,a,c,l;for(r=0,o=t.length;r<o;r++)a=t[r]*n,c=r<o-1?t[r+1]*n:s.length,l=Ju(s,a,c,n,!1),l===l.next&&(l.steiner=!0),i.push(n_(l));for(i.sort(Zv),r=0;r<i.length;r++)e=Kv(i[r],e);return e}function Zv(s,t){return s.x-t.x}function Kv(s,t){const e=Jv(s,t);if(!e)return t;const n=tf(e,s);return Ui(n,n.next),Ui(e,e.next)}function Jv(s,t){let e=t,n=-1/0,i;const r=s.x,o=s.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){const u=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=r&&u>n&&(n=u,i=e.x<e.next.x?e:e.next,u===r))return i}e=e.next}while(e!==t);if(!i)return null;const a=i,c=i.x,l=i.y;let h=1/0,f;e=i;do r>=e.x&&e.x>=c&&r!==e.x&&hs(o<l?r:n,o,c,l,o<l?n:r,o,e.x,e.y)&&(f=Math.abs(o-e.y)/(r-e.x),ur(e,s)&&(f<h||f===h&&(e.x>i.x||e.x===i.x&&Qv(i,e)))&&(i=e,h=f)),e=e.next;while(e!==a);return i}function Qv(s,t){return he(s.prev,s,t.prev)<0&&he(t.next,s,s.next)<0}function t_(s,t,e,n){let i=s;do i.z===0&&(i.z=Tc(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,e_(i)}function e_(s){let t,e,n,i,r,o,a,c,l=1;do{for(e=s,s=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<l&&(a++,n=n.nextZ,!!n);t++);for(c=l;a>0||c>0&&n;)a!==0&&(c===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,a--):(i=n,n=n.nextZ,c--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;e=n}r.nextZ=null,l*=2}while(o>1);return s}function Tc(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function n_(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function hs(s,t,e,n,i,r,o,a){return(i-o)*(t-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(i-o)*(n-a)}function i_(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!s_(s,t)&&(ur(s,t)&&ur(t,s)&&r_(s,t)&&(he(s.prev,s,t.prev)||he(s,t.prev,t))||No(s,t)&&he(s.prev,s,s.next)>0&&he(t.prev,t,t.next)>0)}function he(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function No(s,t){return s.x===t.x&&s.y===t.y}function Qu(s,t,e,n){const i=Wr(he(s,t,e)),r=Wr(he(s,t,n)),o=Wr(he(e,n,s)),a=Wr(he(e,n,t));return!!(i!==r&&o!==a||i===0&&Hr(s,e,t)||r===0&&Hr(s,n,t)||o===0&&Hr(e,s,n)||a===0&&Hr(e,t,n))}function Hr(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function Wr(s){return s>0?1:s<0?-1:0}function s_(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&Qu(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function ur(s,t){return he(s.prev,s,s.next)<0?he(s,t,s.next)>=0&&he(s,s.prev,t)>=0:he(s,t,s.prev)<0||he(s,s.next,t)<0}function r_(s,t){let e=s,n=!1;const i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function tf(s,t){const e=new Ac(s.i,s.x,s.y),n=new Ac(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function rh(s,t,e,n){const i=new Ac(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function fr(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Ac(s,t,e){this.i=s,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function o_(s,t,e,n){let i=0;for(let r=t,o=e-n;r<e;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}class ms{static area(t){const e=t.length;let n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return ms.area(t)<0}static triangulateShape(t,e){const n=[],i=[],r=[];oh(t),ah(n,t);let o=t.length;e.forEach(oh);for(let c=0;c<e.length;c++)i.push(o),o+=e[c].length,ah(n,e[c]);const a=Wv.triangulate(n,i);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function oh(s){const t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function ah(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}class Wc extends be{constructor(t=new Ku([new ct(.5,.5),new ct(-.5,.5),new ct(-.5,-.5),new ct(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,i=[],r=[];for(let a=0,c=t.length;a<c;a++){const l=t[a];o(l)}this.setAttribute("position",new le(i,3)),this.setAttribute("uv",new le(r,2)),this.computeVertexNormals();function o(a){const c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,f=e.depth!==void 0?e.depth:1;let u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:d-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3;const p=e.extrudePath,_=e.UVGenerator!==void 0?e.UVGenerator:a_;let y,x=!1,C,w,T,R;p&&(y=p.getSpacedPoints(h),x=!0,u=!1,C=p.computeFrenetFrames(h,!1),w=new U,T=new U,R=new U),u||(g=0,d=0,m=0,v=0);const S=a.extractPoints(l);let M=S.shape;const P=S.holes;if(!ms.isClockWise(M)){M=M.reverse();for(let et=0,lt=P.length;et<lt;et++){const N=P[et];ms.isClockWise(N)&&(P[et]=N.reverse())}}const I=ms.triangulateShape(M,P),F=M;for(let et=0,lt=P.length;et<lt;et++){const N=P[et];M=M.concat(N)}function z(et,lt,N){return lt||console.error("THREE.ExtrudeGeometry: vec does not exist"),et.clone().addScaledVector(lt,N)}const D=M.length,Y=I.length;function G(et,lt,N){let Pt,rt,St;const ut=et.x-lt.x,Ut=et.y-lt.y,yt=N.x-et.x,L=N.y-et.y,b=ut*ut+Ut*Ut,H=ut*L-Ut*yt;if(Math.abs(H)>Number.EPSILON){const Z=Math.sqrt(b),it=Math.sqrt(yt*yt+L*L),K=lt.x-Ut/Z,Tt=lt.y+ut/Z,pt=N.x-L/it,Mt=N.y+yt/it,Yt=((pt-K)*L-(Mt-Tt)*yt)/(ut*L-Ut*yt);Pt=K+ut*Yt-et.x,rt=Tt+Ut*Yt-et.y;const at=Pt*Pt+rt*rt;if(at<=2)return new ct(Pt,rt);St=Math.sqrt(at/2)}else{let Z=!1;ut>Number.EPSILON?yt>Number.EPSILON&&(Z=!0):ut<-Number.EPSILON?yt<-Number.EPSILON&&(Z=!0):Math.sign(Ut)===Math.sign(L)&&(Z=!0),Z?(Pt=-Ut,rt=ut,St=Math.sqrt(b)):(Pt=ut,rt=Ut,St=Math.sqrt(b/2))}return new ct(Pt/St,rt/St)}const X=[];for(let et=0,lt=F.length,N=lt-1,Pt=et+1;et<lt;et++,N++,Pt++)N===lt&&(N=0),Pt===lt&&(Pt=0),X[et]=G(F[et],F[N],F[Pt]);const tt=[];let st,J=X.concat();for(let et=0,lt=P.length;et<lt;et++){const N=P[et];st=[];for(let Pt=0,rt=N.length,St=rt-1,ut=Pt+1;Pt<rt;Pt++,St++,ut++)St===rt&&(St=0),ut===rt&&(ut=0),st[Pt]=G(N[Pt],N[St],N[ut]);tt.push(st),J=J.concat(st)}for(let et=0;et<g;et++){const lt=et/g,N=d*Math.cos(lt*Math.PI/2),Pt=m*Math.sin(lt*Math.PI/2)+v;for(let rt=0,St=F.length;rt<St;rt++){const ut=z(F[rt],X[rt],Pt);ot(ut.x,ut.y,-N)}for(let rt=0,St=P.length;rt<St;rt++){const ut=P[rt];st=tt[rt];for(let Ut=0,yt=ut.length;Ut<yt;Ut++){const L=z(ut[Ut],st[Ut],Pt);ot(L.x,L.y,-N)}}}const Nt=m+v;for(let et=0;et<D;et++){const lt=u?z(M[et],J[et],Nt):M[et];x?(T.copy(C.normals[0]).multiplyScalar(lt.x),w.copy(C.binormals[0]).multiplyScalar(lt.y),R.copy(y[0]).add(T).add(w),ot(R.x,R.y,R.z)):ot(lt.x,lt.y,0)}for(let et=1;et<=h;et++)for(let lt=0;lt<D;lt++){const N=u?z(M[lt],J[lt],Nt):M[lt];x?(T.copy(C.normals[et]).multiplyScalar(N.x),w.copy(C.binormals[et]).multiplyScalar(N.y),R.copy(y[et]).add(T).add(w),ot(R.x,R.y,R.z)):ot(N.x,N.y,f/h*et)}for(let et=g-1;et>=0;et--){const lt=et/g,N=d*Math.cos(lt*Math.PI/2),Pt=m*Math.sin(lt*Math.PI/2)+v;for(let rt=0,St=F.length;rt<St;rt++){const ut=z(F[rt],X[rt],Pt);ot(ut.x,ut.y,f+N)}for(let rt=0,St=P.length;rt<St;rt++){const ut=P[rt];st=tt[rt];for(let Ut=0,yt=ut.length;Ut<yt;Ut++){const L=z(ut[Ut],st[Ut],Pt);x?ot(L.x,L.y+y[h-1].y,y[h-1].x+N):ot(L.x,L.y,f+N)}}}$(),nt();function $(){const et=i.length/3;if(u){let lt=0,N=D*lt;for(let Pt=0;Pt<Y;Pt++){const rt=I[Pt];It(rt[2]+N,rt[1]+N,rt[0]+N)}lt=h+g*2,N=D*lt;for(let Pt=0;Pt<Y;Pt++){const rt=I[Pt];It(rt[0]+N,rt[1]+N,rt[2]+N)}}else{for(let lt=0;lt<Y;lt++){const N=I[lt];It(N[2],N[1],N[0])}for(let lt=0;lt<Y;lt++){const N=I[lt];It(N[0]+D*h,N[1]+D*h,N[2]+D*h)}}n.addGroup(et,i.length/3-et,0)}function nt(){const et=i.length/3;let lt=0;dt(F,lt),lt+=F.length;for(let N=0,Pt=P.length;N<Pt;N++){const rt=P[N];dt(rt,lt),lt+=rt.length}n.addGroup(et,i.length/3-et,1)}function dt(et,lt){let N=et.length;for(;--N>=0;){const Pt=N;let rt=N-1;rt<0&&(rt=et.length-1);for(let St=0,ut=h+g*2;St<ut;St++){const Ut=D*St,yt=D*(St+1),L=lt+Pt+Ut,b=lt+rt+Ut,H=lt+rt+yt,Z=lt+Pt+yt;Ot(L,b,H,Z)}}}function ot(et,lt,N){c.push(et),c.push(lt),c.push(N)}function It(et,lt,N){Dt(et),Dt(lt),Dt(N);const Pt=i.length/3,rt=_.generateTopUV(n,i,Pt-3,Pt-2,Pt-1);Xt(rt[0]),Xt(rt[1]),Xt(rt[2])}function Ot(et,lt,N,Pt){Dt(et),Dt(lt),Dt(Pt),Dt(lt),Dt(N),Dt(Pt);const rt=i.length/3,St=_.generateSideWallUV(n,i,rt-6,rt-3,rt-2,rt-1);Xt(St[0]),Xt(St[1]),Xt(St[3]),Xt(St[1]),Xt(St[2]),Xt(St[3])}function Dt(et){i.push(c[et*3+0]),i.push(c[et*3+1]),i.push(c[et*3+2])}function Xt(et){r.push(et.x),r.push(et.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return c_(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,o=t.shapes.length;r<o;r++){const a=e[t.shapes[r]];n.push(a)}const i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new bc[i.type]().fromJSON(i)),new Wc(n,t.options)}}const a_={generateTopUV:function(s,t,e,n,i){const r=t[e*3],o=t[e*3+1],a=t[n*3],c=t[n*3+1],l=t[i*3],h=t[i*3+1];return[new ct(r,o),new ct(a,c),new ct(l,h)]},generateSideWallUV:function(s,t,e,n,i,r){const o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[n*3],h=t[n*3+1],f=t[n*3+2],u=t[i*3],d=t[i*3+1],m=t[i*3+2],v=t[r*3],g=t[r*3+1],p=t[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new ct(o,1-c),new ct(l,1-f),new ct(u,1-m),new ct(v,1-p)]:[new ct(a,1-c),new ct(h,1-f),new ct(d,1-m),new ct(g,1-p)]}};function c_(s,t,e){if(e.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class mr extends be{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const h=[],f=new U,u=new U,d=[],m=[],v=[],g=[];for(let p=0;p<=n;p++){const _=[],y=p/n;let x=0;p===0&&o===0?x=.5/e:p===n&&c===Math.PI&&(x=-.5/e);for(let C=0;C<=e;C++){const w=C/e;f.x=-t*Math.cos(i+w*r)*Math.sin(o+y*a),f.y=t*Math.cos(o+y*a),f.z=t*Math.sin(i+w*r)*Math.sin(o+y*a),m.push(f.x,f.y,f.z),u.copy(f).normalize(),v.push(u.x,u.y,u.z),g.push(w+x,1-y),_.push(l++)}h.push(_)}for(let p=0;p<n;p++)for(let _=0;_<e;_++){const y=h[p][_+1],x=h[p][_],C=h[p+1][_],w=h[p+1][_+1];(p!==0||o>0)&&d.push(y,x,w),(p!==n-1||c<Math.PI)&&d.push(x,C,w)}this.setIndex(d),this.setAttribute("position",new le(m,3)),this.setAttribute("normal",new le(v,3)),this.setAttribute("uv",new le(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mr(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class qc extends be{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],c=[],l=[],h=new U,f=new U,u=new U;for(let d=0;d<=n;d++)for(let m=0;m<=i;m++){const v=m/i*r,g=d/n*Math.PI*2;f.x=(t+e*Math.cos(g))*Math.cos(v),f.y=(t+e*Math.cos(g))*Math.sin(v),f.z=e*Math.sin(g),a.push(f.x,f.y,f.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),u.subVectors(f,h).normalize(),c.push(u.x,u.y,u.z),l.push(m/i),l.push(d/n)}for(let d=1;d<=n;d++)for(let m=1;m<=i;m++){const v=(i+1)*d+m-1,g=(i+1)*(d-1)+m-1,p=(i+1)*(d-1)+m,_=(i+1)*d+m;o.push(v,g,_),o.push(g,p,_)}this.setIndex(o),this.setAttribute("position",new le(a,3)),this.setAttribute("normal",new le(c,3)),this.setAttribute("uv",new le(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qc(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class l_ extends be{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){const t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}}const ch=new Zt;class h_{constructor(t,e,n=0,i=1/0){this.ray=new Lu(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new Oc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return ch.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ch),this}intersectObject(t,e=!0,n=[]){return Cc(t,this,n,e),n.sort(lh),n}intersectObjects(t,e=!0,n=[]){for(let i=0,r=t.length;i<r;i++)Cc(t[i],this,n,e);return n.sort(lh),n}}function lh(s,t){return s.distance-t.distance}function Cc(s,t,e,n){let i=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let o=0,a=r.length;o<a;o++)Cc(r[o],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lc);class gn{constructor(t){t===void 0&&(t=[0,0,0,0,0,0,0,0,0]),this.elements=t}identity(){const t=this.elements;t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=0,t[8]=1}setZero(){const t=this.elements;t[0]=0,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=0,t[6]=0,t[7]=0,t[8]=0}setTrace(t){const e=this.elements;e[0]=t.x,e[4]=t.y,e[8]=t.z}getTrace(t){t===void 0&&(t=new E);const e=this.elements;return t.x=e[0],t.y=e[4],t.z=e[8],t}vmult(t,e){e===void 0&&(e=new E);const n=this.elements,i=t.x,r=t.y,o=t.z;return e.x=n[0]*i+n[1]*r+n[2]*o,e.y=n[3]*i+n[4]*r+n[5]*o,e.z=n[6]*i+n[7]*r+n[8]*o,e}smult(t){for(let e=0;e<this.elements.length;e++)this.elements[e]*=t}mmult(t,e){e===void 0&&(e=new gn);const n=this.elements,i=t.elements,r=e.elements,o=n[0],a=n[1],c=n[2],l=n[3],h=n[4],f=n[5],u=n[6],d=n[7],m=n[8],v=i[0],g=i[1],p=i[2],_=i[3],y=i[4],x=i[5],C=i[6],w=i[7],T=i[8];return r[0]=o*v+a*_+c*C,r[1]=o*g+a*y+c*w,r[2]=o*p+a*x+c*T,r[3]=l*v+h*_+f*C,r[4]=l*g+h*y+f*w,r[5]=l*p+h*x+f*T,r[6]=u*v+d*_+m*C,r[7]=u*g+d*y+m*w,r[8]=u*p+d*x+m*T,e}scale(t,e){e===void 0&&(e=new gn);const n=this.elements,i=e.elements;for(let r=0;r!==3;r++)i[3*r+0]=t.x*n[3*r+0],i[3*r+1]=t.y*n[3*r+1],i[3*r+2]=t.z*n[3*r+2];return e}solve(t,e){e===void 0&&(e=new E);const n=3,i=4,r=[];let o,a;for(o=0;o<n*i;o++)r.push(0);for(o=0;o<3;o++)for(a=0;a<3;a++)r[o+i*a]=this.elements[o+3*a];r[3]=t.x,r[7]=t.y,r[11]=t.z;let c=3;const l=c;let h;const f=4;let u;do{if(o=l-c,r[o+i*o]===0){for(a=o+1;a<l;a++)if(r[o+i*a]!==0){h=f;do u=f-h,r[u+i*o]+=r[u+i*a];while(--h);break}}if(r[o+i*o]!==0)for(a=o+1;a<l;a++){const d=r[o+i*a]/r[o+i*o];h=f;do u=f-h,r[u+i*a]=u<=o?0:r[u+i*a]-r[u+i*o]*d;while(--h)}}while(--c);if(e.z=r[2*i+3]/r[2*i+2],e.y=(r[1*i+3]-r[1*i+2]*e.z)/r[1*i+1],e.x=(r[0*i+3]-r[0*i+2]*e.z-r[0*i+1]*e.y)/r[0*i+0],isNaN(e.x)||isNaN(e.y)||isNaN(e.z)||e.x===1/0||e.y===1/0||e.z===1/0)throw`Could not solve equation! Got x=[${e.toString()}], b=[${t.toString()}], A=[${this.toString()}]`;return e}e(t,e,n){if(n===void 0)return this.elements[e+3*t];this.elements[e+3*t]=n}copy(t){for(let e=0;e<t.elements.length;e++)this.elements[e]=t.elements[e];return this}toString(){let t="";for(let n=0;n<9;n++)t+=this.elements[n]+",";return t}reverse(t){t===void 0&&(t=new gn);const e=3,n=6,i=u_;let r,o;for(r=0;r<3;r++)for(o=0;o<3;o++)i[r+n*o]=this.elements[r+3*o];i[3]=1,i[9]=0,i[15]=0,i[4]=0,i[10]=1,i[16]=0,i[5]=0,i[11]=0,i[17]=1;let a=3;const c=a;let l;const h=n;let f;do{if(r=c-a,i[r+n*r]===0){for(o=r+1;o<c;o++)if(i[r+n*o]!==0){l=h;do f=h-l,i[f+n*r]+=i[f+n*o];while(--l);break}}if(i[r+n*r]!==0)for(o=r+1;o<c;o++){const u=i[r+n*o]/i[r+n*r];l=h;do f=h-l,i[f+n*o]=f<=r?0:i[f+n*o]-i[f+n*r]*u;while(--l)}}while(--a);r=2;do{o=r-1;do{const u=i[r+n*o]/i[r+n*r];l=n;do f=n-l,i[f+n*o]=i[f+n*o]-i[f+n*r]*u;while(--l)}while(o--)}while(--r);r=2;do{const u=1/i[r+n*r];l=n;do f=n-l,i[f+n*r]=i[f+n*r]*u;while(--l)}while(r--);r=2;do{o=2;do{if(f=i[e+o+n*r],isNaN(f)||f===1/0)throw`Could not reverse! A=[${this.toString()}]`;t.e(r,o,f)}while(o--)}while(r--);return t}setRotationFromQuaternion(t){const e=t.x,n=t.y,i=t.z,r=t.w,o=e+e,a=n+n,c=i+i,l=e*o,h=e*a,f=e*c,u=n*a,d=n*c,m=i*c,v=r*o,g=r*a,p=r*c,_=this.elements;return _[0]=1-(u+m),_[1]=h-p,_[2]=f+g,_[3]=h+p,_[4]=1-(l+m),_[5]=d-v,_[6]=f-g,_[7]=d+v,_[8]=1-(l+u),this}transpose(t){t===void 0&&(t=new gn);const e=this.elements,n=t.elements;let i;return n[0]=e[0],n[4]=e[4],n[8]=e[8],i=e[1],n[1]=e[3],n[3]=i,i=e[2],n[2]=e[6],n[6]=i,i=e[5],n[5]=e[7],n[7]=i,t}}const u_=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];class E{constructor(t,e,n){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),this.x=t,this.y=e,this.z=n}cross(t,e){e===void 0&&(e=new E);const n=t.x,i=t.y,r=t.z,o=this.x,a=this.y,c=this.z;return e.x=a*r-c*i,e.y=c*n-o*r,e.z=o*i-a*n,e}set(t,e,n){return this.x=t,this.y=e,this.z=n,this}setZero(){this.x=this.y=this.z=0}vadd(t,e){if(e)e.x=t.x+this.x,e.y=t.y+this.y,e.z=t.z+this.z;else return new E(this.x+t.x,this.y+t.y,this.z+t.z)}vsub(t,e){if(e)e.x=this.x-t.x,e.y=this.y-t.y,e.z=this.z-t.z;else return new E(this.x-t.x,this.y-t.y,this.z-t.z)}crossmat(){return new gn([0,-this.z,this.y,this.z,0,-this.x,-this.y,this.x,0])}normalize(){const t=this.x,e=this.y,n=this.z,i=Math.sqrt(t*t+e*e+n*n);if(i>0){const r=1/i;this.x*=r,this.y*=r,this.z*=r}else this.x=0,this.y=0,this.z=0;return i}unit(t){t===void 0&&(t=new E);const e=this.x,n=this.y,i=this.z;let r=Math.sqrt(e*e+n*n+i*i);return r>0?(r=1/r,t.x=e*r,t.y=n*r,t.z=i*r):(t.x=1,t.y=0,t.z=0),t}length(){const t=this.x,e=this.y,n=this.z;return Math.sqrt(t*t+e*e+n*n)}lengthSquared(){return this.dot(this)}distanceTo(t){const e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z;return Math.sqrt((r-e)*(r-e)+(o-n)*(o-n)+(a-i)*(a-i))}distanceSquared(t){const e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z;return(r-e)*(r-e)+(o-n)*(o-n)+(a-i)*(a-i)}scale(t,e){e===void 0&&(e=new E);const n=this.x,i=this.y,r=this.z;return e.x=t*n,e.y=t*i,e.z=t*r,e}vmul(t,e){return e===void 0&&(e=new E),e.x=t.x*this.x,e.y=t.y*this.y,e.z=t.z*this.z,e}addScaledVector(t,e,n){return n===void 0&&(n=new E),n.x=this.x+t*e.x,n.y=this.y+t*e.y,n.z=this.z+t*e.z,n}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}isZero(){return this.x===0&&this.y===0&&this.z===0}negate(t){return t===void 0&&(t=new E),t.x=-this.x,t.y=-this.y,t.z=-this.z,t}tangents(t,e){const n=this.length();if(n>0){const i=f_,r=1/n;i.set(this.x*r,this.y*r,this.z*r);const o=d_;Math.abs(i.x)<.9?(o.set(1,0,0),i.cross(o,t)):(o.set(0,1,0),i.cross(o,t)),i.cross(t,e)}else t.set(1,0,0),e.set(0,1,0)}toString(){return`${this.x},${this.y},${this.z}`}toArray(){return[this.x,this.y,this.z]}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}lerp(t,e,n){const i=this.x,r=this.y,o=this.z;n.x=i+(t.x-i)*e,n.y=r+(t.y-r)*e,n.z=o+(t.z-o)*e}almostEquals(t,e){return e===void 0&&(e=1e-6),!(Math.abs(this.x-t.x)>e||Math.abs(this.y-t.y)>e||Math.abs(this.z-t.z)>e)}almostZero(t){return t===void 0&&(t=1e-6),!(Math.abs(this.x)>t||Math.abs(this.y)>t||Math.abs(this.z)>t)}isAntiparallelTo(t,e){return this.negate(hh),hh.almostEquals(t,e)}clone(){return new E(this.x,this.y,this.z)}}E.ZERO=new E(0,0,0);E.UNIT_X=new E(1,0,0);E.UNIT_Y=new E(0,1,0);E.UNIT_Z=new E(0,0,1);const f_=new E,d_=new E,hh=new E;class je{constructor(t){t===void 0&&(t={}),this.lowerBound=new E,this.upperBound=new E,t.lowerBound&&this.lowerBound.copy(t.lowerBound),t.upperBound&&this.upperBound.copy(t.upperBound)}setFromPoints(t,e,n,i){const r=this.lowerBound,o=this.upperBound,a=n;r.copy(t[0]),a&&a.vmult(r,r),o.copy(r);for(let c=1;c<t.length;c++){let l=t[c];a&&(a.vmult(l,uh),l=uh),l.x>o.x&&(o.x=l.x),l.x<r.x&&(r.x=l.x),l.y>o.y&&(o.y=l.y),l.y<r.y&&(r.y=l.y),l.z>o.z&&(o.z=l.z),l.z<r.z&&(r.z=l.z)}return e&&(e.vadd(r,r),e.vadd(o,o)),i&&(r.x-=i,r.y-=i,r.z-=i,o.x+=i,o.y+=i,o.z+=i),this}copy(t){return this.lowerBound.copy(t.lowerBound),this.upperBound.copy(t.upperBound),this}clone(){return new je().copy(this)}extend(t){this.lowerBound.x=Math.min(this.lowerBound.x,t.lowerBound.x),this.upperBound.x=Math.max(this.upperBound.x,t.upperBound.x),this.lowerBound.y=Math.min(this.lowerBound.y,t.lowerBound.y),this.upperBound.y=Math.max(this.upperBound.y,t.upperBound.y),this.lowerBound.z=Math.min(this.lowerBound.z,t.lowerBound.z),this.upperBound.z=Math.max(this.upperBound.z,t.upperBound.z)}overlaps(t){const e=this.lowerBound,n=this.upperBound,i=t.lowerBound,r=t.upperBound,o=i.x<=n.x&&n.x<=r.x||e.x<=r.x&&r.x<=n.x,a=i.y<=n.y&&n.y<=r.y||e.y<=r.y&&r.y<=n.y,c=i.z<=n.z&&n.z<=r.z||e.z<=r.z&&r.z<=n.z;return o&&a&&c}volume(){const t=this.lowerBound,e=this.upperBound;return(e.x-t.x)*(e.y-t.y)*(e.z-t.z)}contains(t){const e=this.lowerBound,n=this.upperBound,i=t.lowerBound,r=t.upperBound;return e.x<=i.x&&n.x>=r.x&&e.y<=i.y&&n.y>=r.y&&e.z<=i.z&&n.z>=r.z}getCorners(t,e,n,i,r,o,a,c){const l=this.lowerBound,h=this.upperBound;t.copy(l),e.set(h.x,l.y,l.z),n.set(h.x,h.y,l.z),i.set(l.x,h.y,h.z),r.set(h.x,l.y,h.z),o.set(l.x,h.y,l.z),a.set(l.x,l.y,h.z),c.copy(h)}toLocalFrame(t,e){const n=fh,i=n[0],r=n[1],o=n[2],a=n[3],c=n[4],l=n[5],h=n[6],f=n[7];this.getCorners(i,r,o,a,c,l,h,f);for(let u=0;u!==8;u++){const d=n[u];t.pointToLocal(d,d)}return e.setFromPoints(n)}toWorldFrame(t,e){const n=fh,i=n[0],r=n[1],o=n[2],a=n[3],c=n[4],l=n[5],h=n[6],f=n[7];this.getCorners(i,r,o,a,c,l,h,f);for(let u=0;u!==8;u++){const d=n[u];t.pointToWorld(d,d)}return e.setFromPoints(n)}overlapsRay(t){const{direction:e,from:n}=t,i=1/e.x,r=1/e.y,o=1/e.z,a=(this.lowerBound.x-n.x)*i,c=(this.upperBound.x-n.x)*i,l=(this.lowerBound.y-n.y)*r,h=(this.upperBound.y-n.y)*r,f=(this.lowerBound.z-n.z)*o,u=(this.upperBound.z-n.z)*o,d=Math.max(Math.max(Math.min(a,c),Math.min(l,h)),Math.min(f,u)),m=Math.min(Math.min(Math.max(a,c),Math.max(l,h)),Math.max(f,u));return!(m<0||d>m)}}const uh=new E,fh=[new E,new E,new E,new E,new E,new E,new E,new E];class dh{constructor(){this.matrix=[]}get(t,e){let{index:n}=t,{index:i}=e;if(i>n){const r=i;i=n,n=r}return this.matrix[(n*(n+1)>>1)+i-1]}set(t,e,n){let{index:i}=t,{index:r}=e;if(r>i){const o=r;r=i,i=o}this.matrix[(i*(i+1)>>1)+r-1]=n?1:0}reset(){for(let t=0,e=this.matrix.length;t!==e;t++)this.matrix[t]=0}setNumObjects(t){this.matrix.length=t*(t-1)>>1}}class ef{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;return n[t]===void 0&&(n[t]=[]),n[t].includes(e)||n[t].push(e),this}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return!!(n[t]!==void 0&&n[t].includes(e))}hasAnyEventListener(t){return this._listeners===void 0?!1:this._listeners[t]!==void 0}removeEventListener(t,e){if(this._listeners===void 0)return this;const n=this._listeners;if(n[t]===void 0)return this;const i=n[t].indexOf(e);return i!==-1&&n[t].splice(i,1),this}dispatchEvent(t){if(this._listeners===void 0)return this;const n=this._listeners[t.type];if(n!==void 0){t.target=this;for(let i=0,r=n.length;i<r;i++)n[i].call(this,t)}return this}}class _e{constructor(t,e,n,i){t===void 0&&(t=0),e===void 0&&(e=0),n===void 0&&(n=0),i===void 0&&(i=1),this.x=t,this.y=e,this.z=n,this.w=i}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}toString(){return`${this.x},${this.y},${this.z},${this.w}`}toArray(){return[this.x,this.y,this.z,this.w]}setFromAxisAngle(t,e){const n=Math.sin(e*.5);return this.x=t.x*n,this.y=t.y*n,this.z=t.z*n,this.w=Math.cos(e*.5),this}toAxisAngle(t){t===void 0&&(t=new E),this.normalize();const e=2*Math.acos(this.w),n=Math.sqrt(1-this.w*this.w);return n<.001?(t.x=this.x,t.y=this.y,t.z=this.z):(t.x=this.x/n,t.y=this.y/n,t.z=this.z/n),[t,e]}setFromVectors(t,e){if(t.isAntiparallelTo(e)){const n=p_,i=m_;t.tangents(n,i),this.setFromAxisAngle(n,Math.PI)}else{const n=t.cross(e);this.x=n.x,this.y=n.y,this.z=n.z,this.w=Math.sqrt(t.length()**2*e.length()**2)+t.dot(e),this.normalize()}return this}mult(t,e){e===void 0&&(e=new _e);const n=this.x,i=this.y,r=this.z,o=this.w,a=t.x,c=t.y,l=t.z,h=t.w;return e.x=n*h+o*a+i*l-r*c,e.y=i*h+o*c+r*a-n*l,e.z=r*h+o*l+n*c-i*a,e.w=o*h-n*a-i*c-r*l,e}inverse(t){t===void 0&&(t=new _e);const e=this.x,n=this.y,i=this.z,r=this.w;this.conjugate(t);const o=1/(e*e+n*n+i*i+r*r);return t.x*=o,t.y*=o,t.z*=o,t.w*=o,t}conjugate(t){return t===void 0&&(t=new _e),t.x=-this.x,t.y=-this.y,t.z=-this.z,t.w=this.w,t}normalize(){let t=Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w);return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(t=1/t,this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}normalizeFast(){const t=(3-(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w))/2;return t===0?(this.x=0,this.y=0,this.z=0,this.w=0):(this.x*=t,this.y*=t,this.z*=t,this.w*=t),this}vmult(t,e){e===void 0&&(e=new E);const n=t.x,i=t.y,r=t.z,o=this.x,a=this.y,c=this.z,l=this.w,h=l*n+a*r-c*i,f=l*i+c*n-o*r,u=l*r+o*i-a*n,d=-o*n-a*i-c*r;return e.x=h*l+d*-o+f*-c-u*-a,e.y=f*l+d*-a+u*-o-h*-c,e.z=u*l+d*-c+h*-a-f*-o,e}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}toEuler(t,e){e===void 0&&(e="YZX");let n,i,r;const o=this.x,a=this.y,c=this.z,l=this.w;switch(e){case"YZX":const h=o*a+c*l;if(h>.499&&(n=2*Math.atan2(o,l),i=Math.PI/2,r=0),h<-.499&&(n=-2*Math.atan2(o,l),i=-Math.PI/2,r=0),n===void 0){const f=o*o,u=a*a,d=c*c;n=Math.atan2(2*a*l-2*o*c,1-2*u-2*d),i=Math.asin(2*h),r=Math.atan2(2*o*l-2*a*c,1-2*f-2*d)}break;default:throw new Error(`Euler order ${e} not supported yet.`)}t.y=n,t.z=i,t.x=r}setFromEuler(t,e,n,i){i===void 0&&(i="XYZ");const r=Math.cos(t/2),o=Math.cos(e/2),a=Math.cos(n/2),c=Math.sin(t/2),l=Math.sin(e/2),h=Math.sin(n/2);return i==="XYZ"?(this.x=c*o*a+r*l*h,this.y=r*l*a-c*o*h,this.z=r*o*h+c*l*a,this.w=r*o*a-c*l*h):i==="YXZ"?(this.x=c*o*a+r*l*h,this.y=r*l*a-c*o*h,this.z=r*o*h-c*l*a,this.w=r*o*a+c*l*h):i==="ZXY"?(this.x=c*o*a-r*l*h,this.y=r*l*a+c*o*h,this.z=r*o*h+c*l*a,this.w=r*o*a-c*l*h):i==="ZYX"?(this.x=c*o*a-r*l*h,this.y=r*l*a+c*o*h,this.z=r*o*h-c*l*a,this.w=r*o*a+c*l*h):i==="YZX"?(this.x=c*o*a+r*l*h,this.y=r*l*a+c*o*h,this.z=r*o*h-c*l*a,this.w=r*o*a-c*l*h):i==="XZY"&&(this.x=c*o*a-r*l*h,this.y=r*l*a-c*o*h,this.z=r*o*h+c*l*a,this.w=r*o*a+c*l*h),this}clone(){return new _e(this.x,this.y,this.z,this.w)}slerp(t,e,n){n===void 0&&(n=new _e);const i=this.x,r=this.y,o=this.z,a=this.w;let c=t.x,l=t.y,h=t.z,f=t.w,u,d,m,v,g;return d=i*c+r*l+o*h+a*f,d<0&&(d=-d,c=-c,l=-l,h=-h,f=-f),1-d>1e-6?(u=Math.acos(d),m=Math.sin(u),v=Math.sin((1-e)*u)/m,g=Math.sin(e*u)/m):(v=1-e,g=e),n.x=v*i+g*c,n.y=v*r+g*l,n.z=v*o+g*h,n.w=v*a+g*f,n}integrate(t,e,n,i){i===void 0&&(i=new _e);const r=t.x*n.x,o=t.y*n.y,a=t.z*n.z,c=this.x,l=this.y,h=this.z,f=this.w,u=e*.5;return i.x+=u*(r*f+o*h-a*l),i.y+=u*(o*f+a*c-r*h),i.z+=u*(a*f+r*l-o*c),i.w+=u*(-r*c-o*l-a*h),i}}const p_=new E,m_=new E,g_={SPHERE:1,PLANE:2,BOX:4,COMPOUND:8,CONVEXPOLYHEDRON:16,HEIGHTFIELD:32,PARTICLE:64,CYLINDER:128,TRIMESH:256};class xt{constructor(t){t===void 0&&(t={}),this.id=xt.idCounter++,this.type=t.type||0,this.boundingSphereRadius=0,this.collisionResponse=t.collisionResponse?t.collisionResponse:!0,this.collisionFilterGroup=t.collisionFilterGroup!==void 0?t.collisionFilterGroup:1,this.collisionFilterMask=t.collisionFilterMask!==void 0?t.collisionFilterMask:-1,this.material=t.material?t.material:null,this.body=null}updateBoundingSphereRadius(){throw`computeBoundingSphereRadius() not implemented for shape type ${this.type}`}volume(){throw`volume() not implemented for shape type ${this.type}`}calculateLocalInertia(t,e){throw`calculateLocalInertia() not implemented for shape type ${this.type}`}calculateWorldAABB(t,e,n,i){throw`calculateWorldAABB() not implemented for shape type ${this.type}`}}xt.idCounter=0;xt.types=g_;class Jt{constructor(t){t===void 0&&(t={}),this.position=new E,this.quaternion=new _e,t.position&&this.position.copy(t.position),t.quaternion&&this.quaternion.copy(t.quaternion)}pointToLocal(t,e){return Jt.pointToLocalFrame(this.position,this.quaternion,t,e)}pointToWorld(t,e){return Jt.pointToWorldFrame(this.position,this.quaternion,t,e)}vectorToWorldFrame(t,e){return e===void 0&&(e=new E),this.quaternion.vmult(t,e),e}static pointToLocalFrame(t,e,n,i){return i===void 0&&(i=new E),n.vsub(t,i),e.conjugate(ph),ph.vmult(i,i),i}static pointToWorldFrame(t,e,n,i){return i===void 0&&(i=new E),e.vmult(n,i),i.vadd(t,i),i}static vectorToWorldFrame(t,e,n){return n===void 0&&(n=new E),t.vmult(e,n),n}static vectorToLocalFrame(t,e,n,i){return i===void 0&&(i=new E),e.w*=-1,e.vmult(n,i),e.w*=-1,i}}const ph=new _e;class gs extends xt{constructor(t){t===void 0&&(t={});const{vertices:e=[],faces:n=[],normals:i=[],axes:r,boundingSphereRadius:o}=t;super({type:xt.types.CONVEXPOLYHEDRON}),this.vertices=e,this.faces=n,this.faceNormals=i,this.faceNormals.length===0&&this.computeNormals(),o?this.boundingSphereRadius=o:this.updateBoundingSphereRadius(),this.worldVertices=[],this.worldVerticesNeedsUpdate=!0,this.worldFaceNormals=[],this.worldFaceNormalsNeedsUpdate=!0,this.uniqueAxes=r?r.slice():null,this.uniqueEdges=[],this.computeEdges()}computeEdges(){const t=this.faces,e=this.vertices,n=this.uniqueEdges;n.length=0;const i=new E;for(let r=0;r!==t.length;r++){const o=t[r],a=o.length;for(let c=0;c!==a;c++){const l=(c+1)%a;e[o[c]].vsub(e[o[l]],i),i.normalize();let h=!1;for(let f=0;f!==n.length;f++)if(n[f].almostEquals(i)||n[f].almostEquals(i)){h=!0;break}h||n.push(i.clone())}}}computeNormals(){this.faceNormals.length=this.faces.length;for(let t=0;t<this.faces.length;t++){for(let i=0;i<this.faces[t].length;i++)if(!this.vertices[this.faces[t][i]])throw new Error(`Vertex ${this.faces[t][i]} not found!`);const e=this.faceNormals[t]||new E;this.getFaceNormal(t,e),e.negate(e),this.faceNormals[t]=e;const n=this.vertices[this.faces[t][0]];if(e.dot(n)<0){console.error(`.faceNormals[${t}] = Vec3(${e.toString()}) looks like it points into the shape? The vertices follow. Make sure they are ordered CCW around the normal, using the right hand rule.`);for(let i=0;i<this.faces[t].length;i++)console.warn(`.vertices[${this.faces[t][i]}] = Vec3(${this.vertices[this.faces[t][i]].toString()})`)}}}getFaceNormal(t,e){const n=this.faces[t],i=this.vertices[n[0]],r=this.vertices[n[1]],o=this.vertices[n[2]];gs.computeNormal(i,r,o,e)}static computeNormal(t,e,n,i){const r=new E,o=new E;e.vsub(t,o),n.vsub(e,r),r.cross(o,i),i.isZero()||i.normalize()}clipAgainstHull(t,e,n,i,r,o,a,c,l){const h=new E;let f=-1,u=-Number.MAX_VALUE;for(let m=0;m<n.faces.length;m++){h.copy(n.faceNormals[m]),r.vmult(h,h);const v=h.dot(o);v>u&&(u=v,f=m)}const d=[];for(let m=0;m<n.faces[f].length;m++){const v=n.vertices[n.faces[f][m]],g=new E;g.copy(v),r.vmult(g,g),i.vadd(g,g),d.push(g)}f>=0&&this.clipFaceAgainstHull(o,t,e,d,a,c,l)}findSeparatingAxis(t,e,n,i,r,o,a,c){const l=new E,h=new E,f=new E,u=new E,d=new E,m=new E;let v=Number.MAX_VALUE;const g=this;if(g.uniqueAxes)for(let p=0;p!==g.uniqueAxes.length;p++){n.vmult(g.uniqueAxes[p],l);const _=g.testSepAxis(l,t,e,n,i,r);if(_===!1)return!1;_<v&&(v=_,o.copy(l))}else{const p=a?a.length:g.faces.length;for(let _=0;_<p;_++){const y=a?a[_]:_;l.copy(g.faceNormals[y]),n.vmult(l,l);const x=g.testSepAxis(l,t,e,n,i,r);if(x===!1)return!1;x<v&&(v=x,o.copy(l))}}if(t.uniqueAxes)for(let p=0;p!==t.uniqueAxes.length;p++){r.vmult(t.uniqueAxes[p],h);const _=g.testSepAxis(h,t,e,n,i,r);if(_===!1)return!1;_<v&&(v=_,o.copy(h))}else{const p=c?c.length:t.faces.length;for(let _=0;_<p;_++){const y=c?c[_]:_;h.copy(t.faceNormals[y]),r.vmult(h,h);const x=g.testSepAxis(h,t,e,n,i,r);if(x===!1)return!1;x<v&&(v=x,o.copy(h))}}for(let p=0;p!==g.uniqueEdges.length;p++){n.vmult(g.uniqueEdges[p],u);for(let _=0;_!==t.uniqueEdges.length;_++)if(r.vmult(t.uniqueEdges[_],d),u.cross(d,m),!m.almostZero()){m.normalize();const y=g.testSepAxis(m,t,e,n,i,r);if(y===!1)return!1;y<v&&(v=y,o.copy(m))}}return i.vsub(e,f),f.dot(o)>0&&o.negate(o),!0}testSepAxis(t,e,n,i,r,o){const a=this;gs.project(a,t,n,i,xa),gs.project(e,t,r,o,ya);const c=xa[0],l=xa[1],h=ya[0],f=ya[1];if(c<f||h<l)return!1;const u=c-f,d=h-l;return u<d?u:d}calculateLocalInertia(t,e){const n=new E,i=new E;this.computeLocalAABB(i,n);const r=n.x-i.x,o=n.y-i.y,a=n.z-i.z;e.x=1/12*t*(2*o*2*o+2*a*2*a),e.y=1/12*t*(2*r*2*r+2*a*2*a),e.z=1/12*t*(2*o*2*o+2*r*2*r)}getPlaneConstantOfFace(t){const e=this.faces[t],n=this.faceNormals[t],i=this.vertices[e[0]];return-n.dot(i)}clipFaceAgainstHull(t,e,n,i,r,o,a){const c=new E,l=new E,h=new E,f=new E,u=new E,d=new E,m=new E,v=new E,g=this,p=[],_=i,y=p;let x=-1,C=Number.MAX_VALUE;for(let M=0;M<g.faces.length;M++){c.copy(g.faceNormals[M]),n.vmult(c,c);const P=c.dot(t);P<C&&(C=P,x=M)}if(x<0)return;const w=g.faces[x];w.connectedFaces=[];for(let M=0;M<g.faces.length;M++)for(let P=0;P<g.faces[M].length;P++)w.indexOf(g.faces[M][P])!==-1&&M!==x&&w.connectedFaces.indexOf(M)===-1&&w.connectedFaces.push(M);const T=w.length;for(let M=0;M<T;M++){const P=g.vertices[w[M]],O=g.vertices[w[(M+1)%T]];P.vsub(O,l),h.copy(l),n.vmult(h,h),e.vadd(h,h),f.copy(this.faceNormals[x]),n.vmult(f,f),e.vadd(f,f),h.cross(f,u),u.negate(u),d.copy(P),n.vmult(d,d),e.vadd(d,d);const I=w.connectedFaces[M];m.copy(this.faceNormals[I]);const F=this.getPlaneConstantOfFace(I);v.copy(m),n.vmult(v,v);const z=F-v.dot(e);for(this.clipFaceAgainstPlane(_,y,v,z);_.length;)_.shift();for(;y.length;)_.push(y.shift())}m.copy(this.faceNormals[x]);const R=this.getPlaneConstantOfFace(x);v.copy(m),n.vmult(v,v);const S=R-v.dot(e);for(let M=0;M<_.length;M++){let P=v.dot(_[M])+S;if(P<=r&&(console.log(`clamped: depth=${P} to minDist=${r}`),P=r),P<=o){const O=_[M];if(P<=1e-6){const I={point:O,normal:v,depth:P};a.push(I)}}}}clipFaceAgainstPlane(t,e,n,i){let r,o;const a=t.length;if(a<2)return e;let c=t[t.length-1],l=t[0];r=n.dot(c)+i;for(let h=0;h<a;h++){if(l=t[h],o=n.dot(l)+i,r<0)if(o<0){const f=new E;f.copy(l),e.push(f)}else{const f=new E;c.lerp(l,r/(r-o),f),e.push(f)}else if(o<0){const f=new E;c.lerp(l,r/(r-o),f),e.push(f),e.push(l)}c=l,r=o}return e}computeWorldVertices(t,e){for(;this.worldVertices.length<this.vertices.length;)this.worldVertices.push(new E);const n=this.vertices,i=this.worldVertices;for(let r=0;r!==this.vertices.length;r++)e.vmult(n[r],i[r]),t.vadd(i[r],i[r]);this.worldVerticesNeedsUpdate=!1}computeLocalAABB(t,e){const n=this.vertices;t.set(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),e.set(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);for(let i=0;i<this.vertices.length;i++){const r=n[i];r.x<t.x?t.x=r.x:r.x>e.x&&(e.x=r.x),r.y<t.y?t.y=r.y:r.y>e.y&&(e.y=r.y),r.z<t.z?t.z=r.z:r.z>e.z&&(e.z=r.z)}}computeWorldFaceNormals(t){const e=this.faceNormals.length;for(;this.worldFaceNormals.length<e;)this.worldFaceNormals.push(new E);const n=this.faceNormals,i=this.worldFaceNormals;for(let r=0;r!==e;r++)t.vmult(n[r],i[r]);this.worldFaceNormalsNeedsUpdate=!1}updateBoundingSphereRadius(){let t=0;const e=this.vertices;for(let n=0;n!==e.length;n++){const i=e[n].lengthSquared();i>t&&(t=i)}this.boundingSphereRadius=Math.sqrt(t)}calculateWorldAABB(t,e,n,i){const r=this.vertices;let o,a,c,l,h,f,u=new E;for(let d=0;d<r.length;d++){u.copy(r[d]),e.vmult(u,u),t.vadd(u,u);const m=u;(o===void 0||m.x<o)&&(o=m.x),(l===void 0||m.x>l)&&(l=m.x),(a===void 0||m.y<a)&&(a=m.y),(h===void 0||m.y>h)&&(h=m.y),(c===void 0||m.z<c)&&(c=m.z),(f===void 0||m.z>f)&&(f=m.z)}n.set(o,a,c),i.set(l,h,f)}volume(){return 4*Math.PI*this.boundingSphereRadius/3}getAveragePointLocal(t){t===void 0&&(t=new E);const e=this.vertices;for(let n=0;n<e.length;n++)t.vadd(e[n],t);return t.scale(1/e.length,t),t}transformAllPoints(t,e){const n=this.vertices.length,i=this.vertices;if(e){for(let r=0;r<n;r++){const o=i[r];e.vmult(o,o)}for(let r=0;r<this.faceNormals.length;r++){const o=this.faceNormals[r];e.vmult(o,o)}}if(t)for(let r=0;r<n;r++){const o=i[r];o.vadd(t,o)}}pointIsInside(t){const e=this.vertices,n=this.faces,i=this.faceNormals,r=new E;this.getAveragePointLocal(r);for(let o=0;o<this.faces.length;o++){let a=i[o];const c=e[n[o][0]],l=new E;t.vsub(c,l);const h=a.dot(l),f=new E;r.vsub(c,f);const u=a.dot(f);if(h<0&&u>0||h>0&&u<0)return!1}return-1}static project(t,e,n,i,r){const o=t.vertices.length,a=v_;let c=0,l=0;const h=__,f=t.vertices;h.setZero(),Jt.vectorToLocalFrame(n,i,e,a),Jt.pointToLocalFrame(n,i,h,h);const u=h.dot(a);l=c=f[0].dot(a);for(let d=1;d<o;d++){const m=f[d].dot(a);m>c&&(c=m),m<l&&(l=m)}if(l-=u,c-=u,l>c){const d=l;l=c,c=d}r[0]=c,r[1]=l}}const xa=[],ya=[];new E;const v_=new E,__=new E;class bs extends xt{constructor(t){super({type:xt.types.BOX}),this.halfExtents=t,this.convexPolyhedronRepresentation=null,this.updateConvexPolyhedronRepresentation(),this.updateBoundingSphereRadius()}updateConvexPolyhedronRepresentation(){const t=this.halfExtents.x,e=this.halfExtents.y,n=this.halfExtents.z,i=E,r=[new i(-t,-e,-n),new i(t,-e,-n),new i(t,e,-n),new i(-t,e,-n),new i(-t,-e,n),new i(t,-e,n),new i(t,e,n),new i(-t,e,n)],o=[[3,2,1,0],[4,5,6,7],[5,4,0,1],[2,3,7,6],[0,4,7,3],[1,2,6,5]],a=[new i(0,0,1),new i(0,1,0),new i(1,0,0)],c=new gs({vertices:r,faces:o,axes:a});this.convexPolyhedronRepresentation=c,c.material=this.material}calculateLocalInertia(t,e){return e===void 0&&(e=new E),bs.calculateInertia(this.halfExtents,t,e),e}static calculateInertia(t,e,n){const i=t;n.x=1/12*e*(2*i.y*2*i.y+2*i.z*2*i.z),n.y=1/12*e*(2*i.x*2*i.x+2*i.z*2*i.z),n.z=1/12*e*(2*i.y*2*i.y+2*i.x*2*i.x)}getSideNormals(t,e){const n=t,i=this.halfExtents;if(n[0].set(i.x,0,0),n[1].set(0,i.y,0),n[2].set(0,0,i.z),n[3].set(-i.x,0,0),n[4].set(0,-i.y,0),n[5].set(0,0,-i.z),e!==void 0)for(let r=0;r!==n.length;r++)e.vmult(n[r],n[r]);return n}volume(){return 8*this.halfExtents.x*this.halfExtents.y*this.halfExtents.z}updateBoundingSphereRadius(){this.boundingSphereRadius=this.halfExtents.length()}forEachWorldCorner(t,e,n){const i=this.halfExtents,r=[[i.x,i.y,i.z],[-i.x,i.y,i.z],[-i.x,-i.y,i.z],[-i.x,-i.y,-i.z],[i.x,-i.y,-i.z],[i.x,i.y,-i.z],[-i.x,i.y,-i.z],[i.x,-i.y,i.z]];for(let o=0;o<r.length;o++)ii.set(r[o][0],r[o][1],r[o][2]),e.vmult(ii,ii),t.vadd(ii,ii),n(ii.x,ii.y,ii.z)}calculateWorldAABB(t,e,n,i){const r=this.halfExtents;_n[0].set(r.x,r.y,r.z),_n[1].set(-r.x,r.y,r.z),_n[2].set(-r.x,-r.y,r.z),_n[3].set(-r.x,-r.y,-r.z),_n[4].set(r.x,-r.y,-r.z),_n[5].set(r.x,r.y,-r.z),_n[6].set(-r.x,r.y,-r.z),_n[7].set(r.x,-r.y,r.z);const o=_n[0];e.vmult(o,o),t.vadd(o,o),i.copy(o),n.copy(o);for(let a=1;a<8;a++){const c=_n[a];e.vmult(c,c),t.vadd(c,c);const l=c.x,h=c.y,f=c.z;l>i.x&&(i.x=l),h>i.y&&(i.y=h),f>i.z&&(i.z=f),l<n.x&&(n.x=l),h<n.y&&(n.y=h),f<n.z&&(n.z=f)}}}const ii=new E,_n=[new E,new E,new E,new E,new E,new E,new E,new E],Xc={DYNAMIC:1,STATIC:2,KINEMATIC:4},Yc={AWAKE:0,SLEEPY:1,SLEEPING:2};class Et extends ef{constructor(t){t===void 0&&(t={}),super(),this.id=Et.idCounter++,this.index=-1,this.world=null,this.vlambda=new E,this.collisionFilterGroup=typeof t.collisionFilterGroup=="number"?t.collisionFilterGroup:1,this.collisionFilterMask=typeof t.collisionFilterMask=="number"?t.collisionFilterMask:-1,this.collisionResponse=typeof t.collisionResponse=="boolean"?t.collisionResponse:!0,this.position=new E,this.previousPosition=new E,this.interpolatedPosition=new E,this.initPosition=new E,t.position&&(this.position.copy(t.position),this.previousPosition.copy(t.position),this.interpolatedPosition.copy(t.position),this.initPosition.copy(t.position)),this.velocity=new E,t.velocity&&this.velocity.copy(t.velocity),this.initVelocity=new E,this.force=new E;const e=typeof t.mass=="number"?t.mass:0;this.mass=e,this.invMass=e>0?1/e:0,this.material=t.material||null,this.linearDamping=typeof t.linearDamping=="number"?t.linearDamping:.01,this.type=e<=0?Et.STATIC:Et.DYNAMIC,typeof t.type==typeof Et.STATIC&&(this.type=t.type),this.allowSleep=typeof t.allowSleep<"u"?t.allowSleep:!0,this.sleepState=Et.AWAKE,this.sleepSpeedLimit=typeof t.sleepSpeedLimit<"u"?t.sleepSpeedLimit:.1,this.sleepTimeLimit=typeof t.sleepTimeLimit<"u"?t.sleepTimeLimit:1,this.timeLastSleepy=0,this.wakeUpAfterNarrowphase=!1,this.torque=new E,this.quaternion=new _e,this.initQuaternion=new _e,this.previousQuaternion=new _e,this.interpolatedQuaternion=new _e,t.quaternion&&(this.quaternion.copy(t.quaternion),this.initQuaternion.copy(t.quaternion),this.previousQuaternion.copy(t.quaternion),this.interpolatedQuaternion.copy(t.quaternion)),this.angularVelocity=new E,t.angularVelocity&&this.angularVelocity.copy(t.angularVelocity),this.initAngularVelocity=new E,this.shapes=[],this.shapeOffsets=[],this.shapeOrientations=[],this.inertia=new E,this.invInertia=new E,this.invInertiaWorld=new gn,this.invMassSolve=0,this.invInertiaSolve=new E,this.invInertiaWorldSolve=new gn,this.fixedRotation=typeof t.fixedRotation<"u"?t.fixedRotation:!1,this.angularDamping=typeof t.angularDamping<"u"?t.angularDamping:.01,this.linearFactor=new E(1,1,1),t.linearFactor&&this.linearFactor.copy(t.linearFactor),this.angularFactor=new E(1,1,1),t.angularFactor&&this.angularFactor.copy(t.angularFactor),this.aabb=new je,this.aabbNeedsUpdate=!0,this.boundingRadius=0,this.wlambda=new E,this.isTrigger=!!t.isTrigger,t.shape&&this.addShape(t.shape),this.updateMassProperties()}wakeUp(){const t=this.sleepState;this.sleepState=Et.AWAKE,this.wakeUpAfterNarrowphase=!1,t===Et.SLEEPING&&this.dispatchEvent(Et.wakeupEvent)}sleep(){this.sleepState=Et.SLEEPING,this.velocity.set(0,0,0),this.angularVelocity.set(0,0,0),this.wakeUpAfterNarrowphase=!1}sleepTick(t){if(this.allowSleep){const e=this.sleepState,n=this.velocity.lengthSquared()+this.angularVelocity.lengthSquared(),i=this.sleepSpeedLimit**2;e===Et.AWAKE&&n<i?(this.sleepState=Et.SLEEPY,this.timeLastSleepy=t,this.dispatchEvent(Et.sleepyEvent)):e===Et.SLEEPY&&n>i?this.wakeUp():e===Et.SLEEPY&&t-this.timeLastSleepy>this.sleepTimeLimit&&(this.sleep(),this.dispatchEvent(Et.sleepEvent))}}updateSolveMassProperties(){this.sleepState===Et.SLEEPING||this.type===Et.KINEMATIC?(this.invMassSolve=0,this.invInertiaSolve.setZero(),this.invInertiaWorldSolve.setZero()):(this.invMassSolve=this.invMass,this.invInertiaSolve.copy(this.invInertia),this.invInertiaWorldSolve.copy(this.invInertiaWorld))}pointToLocalFrame(t,e){return e===void 0&&(e=new E),t.vsub(this.position,e),this.quaternion.conjugate().vmult(e,e),e}vectorToLocalFrame(t,e){return e===void 0&&(e=new E),this.quaternion.conjugate().vmult(t,e),e}pointToWorldFrame(t,e){return e===void 0&&(e=new E),this.quaternion.vmult(t,e),e.vadd(this.position,e),e}vectorToWorldFrame(t,e){return e===void 0&&(e=new E),this.quaternion.vmult(t,e),e}addShape(t,e,n){const i=new E,r=new _e;return e&&i.copy(e),n&&r.copy(n),this.shapes.push(t),this.shapeOffsets.push(i),this.shapeOrientations.push(r),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=this,this}removeShape(t){const e=this.shapes.indexOf(t);return e===-1?(console.warn("Shape does not belong to the body"),this):(this.shapes.splice(e,1),this.shapeOffsets.splice(e,1),this.shapeOrientations.splice(e,1),this.updateMassProperties(),this.updateBoundingRadius(),this.aabbNeedsUpdate=!0,t.body=null,this)}updateBoundingRadius(){const t=this.shapes,e=this.shapeOffsets,n=t.length;let i=0;for(let r=0;r!==n;r++){const o=t[r];o.updateBoundingSphereRadius();const a=e[r].length(),c=o.boundingSphereRadius;a+c>i&&(i=a+c)}this.boundingRadius=i}updateAABB(){const t=this.shapes,e=this.shapeOffsets,n=this.shapeOrientations,i=t.length,r=x_,o=y_,a=this.quaternion,c=this.aabb,l=M_;for(let h=0;h!==i;h++){const f=t[h];a.vmult(e[h],r),r.vadd(this.position,r),a.mult(n[h],o),f.calculateWorldAABB(r,o,l.lowerBound,l.upperBound),h===0?c.copy(l):c.extend(l)}this.aabbNeedsUpdate=!1}updateInertiaWorld(t){const e=this.invInertia;if(!(e.x===e.y&&e.y===e.z&&!t)){const n=S_,i=E_;n.setRotationFromQuaternion(this.quaternion),n.transpose(i),n.scale(e,n),n.mmult(i,this.invInertiaWorld)}}applyForce(t,e){if(e===void 0&&(e=new E),this.type!==Et.DYNAMIC)return;this.sleepState===Et.SLEEPING&&this.wakeUp();const n=w_;e.cross(t,n),this.force.vadd(t,this.force),this.torque.vadd(n,this.torque)}applyLocalForce(t,e){if(e===void 0&&(e=new E),this.type!==Et.DYNAMIC)return;const n=b_,i=T_;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,i),this.applyForce(n,i)}applyTorque(t){this.type===Et.DYNAMIC&&(this.sleepState===Et.SLEEPING&&this.wakeUp(),this.torque.vadd(t,this.torque))}applyImpulse(t,e){if(e===void 0&&(e=new E),this.type!==Et.DYNAMIC)return;this.sleepState===Et.SLEEPING&&this.wakeUp();const n=e,i=A_;i.copy(t),i.scale(this.invMass,i),this.velocity.vadd(i,this.velocity);const r=C_;n.cross(t,r),this.invInertiaWorld.vmult(r,r),this.angularVelocity.vadd(r,this.angularVelocity)}applyLocalImpulse(t,e){if(e===void 0&&(e=new E),this.type!==Et.DYNAMIC)return;const n=R_,i=P_;this.vectorToWorldFrame(t,n),this.vectorToWorldFrame(e,i),this.applyImpulse(n,i)}updateMassProperties(){const t=L_;this.invMass=this.mass>0?1/this.mass:0;const e=this.inertia,n=this.fixedRotation;this.updateAABB(),t.set((this.aabb.upperBound.x-this.aabb.lowerBound.x)/2,(this.aabb.upperBound.y-this.aabb.lowerBound.y)/2,(this.aabb.upperBound.z-this.aabb.lowerBound.z)/2),bs.calculateInertia(t,this.mass,e),this.invInertia.set(e.x>0&&!n?1/e.x:0,e.y>0&&!n?1/e.y:0,e.z>0&&!n?1/e.z:0),this.updateInertiaWorld(!0)}getVelocityAtWorldPoint(t,e){const n=new E;return t.vsub(this.position,n),this.angularVelocity.cross(n,e),this.velocity.vadd(e,e),e}integrate(t,e,n){if(this.previousPosition.copy(this.position),this.previousQuaternion.copy(this.quaternion),!(this.type===Et.DYNAMIC||this.type===Et.KINEMATIC)||this.sleepState===Et.SLEEPING)return;const i=this.velocity,r=this.angularVelocity,o=this.position,a=this.force,c=this.torque,l=this.quaternion,h=this.invMass,f=this.invInertiaWorld,u=this.linearFactor,d=h*t;i.x+=a.x*d*u.x,i.y+=a.y*d*u.y,i.z+=a.z*d*u.z;const m=f.elements,v=this.angularFactor,g=c.x*v.x,p=c.y*v.y,_=c.z*v.z;r.x+=t*(m[0]*g+m[1]*p+m[2]*_),r.y+=t*(m[3]*g+m[4]*p+m[5]*_),r.z+=t*(m[6]*g+m[7]*p+m[8]*_),o.x+=i.x*t,o.y+=i.y*t,o.z+=i.z*t,l.integrate(this.angularVelocity,t,this.angularFactor,l),e&&(n?l.normalizeFast():l.normalize()),this.aabbNeedsUpdate=!0,this.updateInertiaWorld()}}Et.idCounter=0;Et.COLLIDE_EVENT_NAME="collide";Et.DYNAMIC=Xc.DYNAMIC;Et.STATIC=Xc.STATIC;Et.KINEMATIC=Xc.KINEMATIC;Et.AWAKE=Yc.AWAKE;Et.SLEEPY=Yc.SLEEPY;Et.SLEEPING=Yc.SLEEPING;Et.wakeupEvent={type:"wakeup"};Et.sleepyEvent={type:"sleepy"};Et.sleepEvent={type:"sleep"};const x_=new E,y_=new _e,M_=new je,S_=new gn,E_=new gn;new gn;const w_=new E,b_=new E,T_=new E,A_=new E,C_=new E,R_=new E,P_=new E,L_=new E;class I_{constructor(){this.world=null,this.useBoundingBoxes=!1,this.dirty=!0}collisionPairs(t,e,n){throw new Error("collisionPairs not implemented for this BroadPhase class!")}needBroadphaseCollision(t,e){return!((t.collisionFilterGroup&e.collisionFilterMask)===0||(e.collisionFilterGroup&t.collisionFilterMask)===0||((t.type&Et.STATIC)!==0||t.sleepState===Et.SLEEPING)&&((e.type&Et.STATIC)!==0||e.sleepState===Et.SLEEPING))}intersectionTest(t,e,n,i){this.useBoundingBoxes?this.doBoundingBoxBroadphase(t,e,n,i):this.doBoundingSphereBroadphase(t,e,n,i)}doBoundingSphereBroadphase(t,e,n,i){const r=N_;e.position.vsub(t.position,r);const o=(t.boundingRadius+e.boundingRadius)**2;r.lengthSquared()<o&&(n.push(t),i.push(e))}doBoundingBoxBroadphase(t,e,n,i){t.aabbNeedsUpdate&&t.updateAABB(),e.aabbNeedsUpdate&&e.updateAABB(),t.aabb.overlaps(e.aabb)&&(n.push(t),i.push(e))}makePairsUnique(t,e){const n=D_,i=U_,r=F_,o=t.length;for(let a=0;a!==o;a++)i[a]=t[a],r[a]=e[a];t.length=0,e.length=0;for(let a=0;a!==o;a++){const c=i[a].id,l=r[a].id,h=c<l?`${c},${l}`:`${l},${c}`;n[h]=a,n.keys.push(h)}for(let a=0;a!==n.keys.length;a++){const c=n.keys.pop(),l=n[c];t.push(i[l]),e.push(r[l]),delete n[c]}}setWorld(t){}static boundingSphereCheck(t,e){const n=new E;t.position.vsub(e.position,n);const i=t.shapes[0],r=e.shapes[0];return Math.pow(i.boundingSphereRadius+r.boundingSphereRadius,2)>n.lengthSquared()}aabbQuery(t,e,n){return console.warn(".aabbQuery is not implemented in this Broadphase subclass."),[]}}const N_=new E;new E;new _e;new E;const D_={keys:[]},U_=[],F_=[];new E;new E;new E;class z_ extends I_{constructor(){super()}collisionPairs(t,e,n){const i=t.bodies,r=i.length;let o,a;for(let c=0;c!==r;c++)for(let l=0;l!==c;l++)o=i[c],a=i[l],this.needBroadphaseCollision(o,a)&&this.intersectionTest(o,a,e,n)}aabbQuery(t,e,n){n===void 0&&(n=[]);for(let i=0;i<t.bodies.length;i++){const r=t.bodies[i];r.aabbNeedsUpdate&&r.updateAABB(),r.aabb.overlaps(e)&&n.push(r)}return n}}class Eo{constructor(){this.rayFromWorld=new E,this.rayToWorld=new E,this.hitNormalWorld=new E,this.hitPointWorld=new E,this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}reset(){this.rayFromWorld.setZero(),this.rayToWorld.setZero(),this.hitNormalWorld.setZero(),this.hitPointWorld.setZero(),this.hasHit=!1,this.shape=null,this.body=null,this.hitFaceIndex=-1,this.distance=-1,this.shouldStop=!1}abort(){this.shouldStop=!0}set(t,e,n,i,r,o,a){this.rayFromWorld.copy(t),this.rayToWorld.copy(e),this.hitNormalWorld.copy(n),this.hitPointWorld.copy(i),this.shape=r,this.body=o,this.distance=a}}let nf,sf,rf,of,af,cf,lf;const $c={CLOSEST:1,ANY:2,ALL:4};nf=xt.types.SPHERE;sf=xt.types.PLANE;rf=xt.types.BOX;of=xt.types.CYLINDER;af=xt.types.CONVEXPOLYHEDRON;cf=xt.types.HEIGHTFIELD;lf=xt.types.TRIMESH;class ve{get[nf](){return this._intersectSphere}get[sf](){return this._intersectPlane}get[rf](){return this._intersectBox}get[of](){return this._intersectConvex}get[af](){return this._intersectConvex}get[cf](){return this._intersectHeightfield}get[lf](){return this._intersectTrimesh}constructor(t,e){t===void 0&&(t=new E),e===void 0&&(e=new E),this.from=t.clone(),this.to=e.clone(),this.direction=new E,this.precision=1e-4,this.checkCollisionResponse=!0,this.skipBackfaces=!1,this.collisionFilterMask=-1,this.collisionFilterGroup=-1,this.mode=ve.ANY,this.result=new Eo,this.hasHit=!1,this.callback=n=>{}}intersectWorld(t,e){return this.mode=e.mode||ve.ANY,this.result=e.result||new Eo,this.skipBackfaces=!!e.skipBackfaces,this.collisionFilterMask=typeof e.collisionFilterMask<"u"?e.collisionFilterMask:-1,this.collisionFilterGroup=typeof e.collisionFilterGroup<"u"?e.collisionFilterGroup:-1,this.checkCollisionResponse=typeof e.checkCollisionResponse<"u"?e.checkCollisionResponse:!0,e.from&&this.from.copy(e.from),e.to&&this.to.copy(e.to),this.callback=e.callback||(()=>{}),this.hasHit=!1,this.result.reset(),this.updateDirection(),this.getAABB(mh),Ma.length=0,t.broadphase.aabbQuery(t,mh,Ma),this.intersectBodies(Ma),this.hasHit}intersectBody(t,e){e&&(this.result=e,this.updateDirection());const n=this.checkCollisionResponse;if(n&&!t.collisionResponse||(this.collisionFilterGroup&t.collisionFilterMask)===0||(t.collisionFilterGroup&this.collisionFilterMask)===0)return;const i=O_,r=B_;for(let o=0,a=t.shapes.length;o<a;o++){const c=t.shapes[o];if(!(n&&!c.collisionResponse)&&(t.quaternion.mult(t.shapeOrientations[o],r),t.quaternion.vmult(t.shapeOffsets[o],i),i.vadd(t.position,i),this.intersectShape(c,r,i,t),this.result.shouldStop))break}}intersectBodies(t,e){e&&(this.result=e,this.updateDirection());for(let n=0,i=t.length;!this.result.shouldStop&&n<i;n++)this.intersectBody(t[n])}updateDirection(){this.to.vsub(this.from,this.direction),this.direction.normalize()}intersectShape(t,e,n,i){const r=this.from;if(Q_(r,this.direction,n)>t.boundingSphereRadius)return;const a=this[t.type];a&&a.call(this,t,e,n,i,t)}_intersectBox(t,e,n,i,r){return this._intersectConvex(t.convexPolyhedronRepresentation,e,n,i,r)}_intersectPlane(t,e,n,i,r){const o=this.from,a=this.to,c=this.direction,l=new E(0,0,1);e.vmult(l,l);const h=new E;o.vsub(n,h);const f=h.dot(l);a.vsub(n,h);const u=h.dot(l);if(f*u>0||o.distanceTo(a)<f)return;const d=l.dot(c);if(Math.abs(d)<this.precision)return;const m=new E,v=new E,g=new E;o.vsub(n,m);const p=-l.dot(m)/d;c.scale(p,v),o.vadd(v,g),this.reportIntersection(l,g,r,i,-1)}getAABB(t){const{lowerBound:e,upperBound:n}=t,i=this.to,r=this.from;e.x=Math.min(i.x,r.x),e.y=Math.min(i.y,r.y),e.z=Math.min(i.z,r.z),n.x=Math.max(i.x,r.x),n.y=Math.max(i.y,r.y),n.z=Math.max(i.z,r.z)}_intersectHeightfield(t,e,n,i,r){t.data,t.elementSize;const o=k_;o.from.copy(this.from),o.to.copy(this.to),Jt.pointToLocalFrame(n,e,o.from,o.from),Jt.pointToLocalFrame(n,e,o.to,o.to),o.updateDirection();const a=V_;let c,l,h,f;c=l=0,h=f=t.data.length-1;const u=new je;o.getAABB(u),t.getIndexOfPosition(u.lowerBound.x,u.lowerBound.y,a,!0),c=Math.max(c,a[0]),l=Math.max(l,a[1]),t.getIndexOfPosition(u.upperBound.x,u.upperBound.y,a,!0),h=Math.min(h,a[0]+1),f=Math.min(f,a[1]+1);for(let d=c;d<h;d++)for(let m=l;m<f;m++){if(this.result.shouldStop)return;if(t.getAabbAtIndex(d,m,u),!!u.overlapsRay(o)){if(t.getConvexTrianglePillar(d,m,!1),Jt.pointToWorldFrame(n,e,t.pillarOffset,qr),this._intersectConvex(t.pillarConvex,e,qr,i,r,gh),this.result.shouldStop)return;t.getConvexTrianglePillar(d,m,!0),Jt.pointToWorldFrame(n,e,t.pillarOffset,qr),this._intersectConvex(t.pillarConvex,e,qr,i,r,gh)}}}_intersectSphere(t,e,n,i,r){const o=this.from,a=this.to,c=t.radius,l=(a.x-o.x)**2+(a.y-o.y)**2+(a.z-o.z)**2,h=2*((a.x-o.x)*(o.x-n.x)+(a.y-o.y)*(o.y-n.y)+(a.z-o.z)*(o.z-n.z)),f=(o.x-n.x)**2+(o.y-n.y)**2+(o.z-n.z)**2-c**2,u=h**2-4*l*f,d=G_,m=H_;if(!(u<0))if(u===0)o.lerp(a,u,d),d.vsub(n,m),m.normalize(),this.reportIntersection(m,d,r,i,-1);else{const v=(-h-Math.sqrt(u))/(2*l),g=(-h+Math.sqrt(u))/(2*l);if(v>=0&&v<=1&&(o.lerp(a,v,d),d.vsub(n,m),m.normalize(),this.reportIntersection(m,d,r,i,-1)),this.result.shouldStop)return;g>=0&&g<=1&&(o.lerp(a,g,d),d.vsub(n,m),m.normalize(),this.reportIntersection(m,d,r,i,-1))}}_intersectConvex(t,e,n,i,r,o){const a=W_,c=vh,l=o&&o.faceList||null,h=t.faces,f=t.vertices,u=t.faceNormals,d=this.direction,m=this.from,v=this.to,g=m.distanceTo(v),p=l?l.length:h.length,_=this.result;for(let y=0;!_.shouldStop&&y<p;y++){const x=l?l[y]:y,C=h[x],w=u[x],T=e,R=n;c.copy(f[C[0]]),T.vmult(c,c),c.vadd(R,c),c.vsub(m,c),T.vmult(w,a);const S=d.dot(a);if(Math.abs(S)<this.precision)continue;const M=a.dot(c)/S;if(!(M<0)){d.scale(M,ke),ke.vadd(m,ke),un.copy(f[C[0]]),T.vmult(un,un),R.vadd(un,un);for(let P=1;!_.shouldStop&&P<C.length-1;P++){xn.copy(f[C[P]]),yn.copy(f[C[P+1]]),T.vmult(xn,xn),T.vmult(yn,yn),R.vadd(xn,xn),R.vadd(yn,yn);const O=ke.distanceTo(m);!(ve.pointInTriangle(ke,un,xn,yn)||ve.pointInTriangle(ke,xn,un,yn))||O>g||this.reportIntersection(a,ke,r,i,x)}}}}_intersectTrimesh(t,e,n,i,r,o){const a=q_,c=K_,l=J_,h=vh,f=X_,u=Y_,d=$_,m=Z_,v=j_,g=t.indices;t.vertices;const p=this.from,_=this.to,y=this.direction;l.position.copy(n),l.quaternion.copy(e),Jt.vectorToLocalFrame(n,e,y,f),Jt.pointToLocalFrame(n,e,p,u),Jt.pointToLocalFrame(n,e,_,d),d.x*=t.scale.x,d.y*=t.scale.y,d.z*=t.scale.z,u.x*=t.scale.x,u.y*=t.scale.y,u.z*=t.scale.z,d.vsub(u,f),f.normalize();const x=u.distanceSquared(d);t.tree.rayQuery(this,l,c);for(let C=0,w=c.length;!this.result.shouldStop&&C!==w;C++){const T=c[C];t.getNormal(T,a),t.getVertex(g[T*3],un),un.vsub(u,h);const R=f.dot(a),S=a.dot(h)/R;if(S<0)continue;f.scale(S,ke),ke.vadd(u,ke),t.getVertex(g[T*3+1],xn),t.getVertex(g[T*3+2],yn);const M=ke.distanceSquared(u);!(ve.pointInTriangle(ke,xn,un,yn)||ve.pointInTriangle(ke,un,xn,yn))||M>x||(Jt.vectorToWorldFrame(e,a,v),Jt.pointToWorldFrame(n,e,ke,m),this.reportIntersection(v,m,r,i,T))}c.length=0}reportIntersection(t,e,n,i,r){const o=this.from,a=this.to,c=o.distanceTo(e),l=this.result;if(!(this.skipBackfaces&&t.dot(this.direction)>0))switch(l.hitFaceIndex=typeof r<"u"?r:-1,this.mode){case ve.ALL:this.hasHit=!0,l.set(o,a,t,e,n,i,c),l.hasHit=!0,this.callback(l);break;case ve.CLOSEST:(c<l.distance||!l.hasHit)&&(this.hasHit=!0,l.hasHit=!0,l.set(o,a,t,e,n,i,c));break;case ve.ANY:this.hasHit=!0,l.hasHit=!0,l.set(o,a,t,e,n,i,c),l.shouldStop=!0;break}}static pointInTriangle(t,e,n,i){i.vsub(e,Ci),n.vsub(e,qs),t.vsub(e,Sa);const r=Ci.dot(Ci),o=Ci.dot(qs),a=Ci.dot(Sa),c=qs.dot(qs),l=qs.dot(Sa);let h,f;return(h=c*a-o*l)>=0&&(f=r*l-o*a)>=0&&h+f<r*c-o*o}}ve.CLOSEST=$c.CLOSEST;ve.ANY=$c.ANY;ve.ALL=$c.ALL;const mh=new je,Ma=[],qs=new E,Sa=new E,O_=new E,B_=new _e,ke=new E,un=new E,xn=new E,yn=new E;new E;new Eo;const gh={faceList:[0]},qr=new E,k_=new ve,V_=[],G_=new E,H_=new E,W_=new E;new E;new E;const vh=new E,q_=new E,X_=new E,Y_=new E,$_=new E,j_=new E,Z_=new E;new je;const K_=[],J_=new Jt,Ci=new E,Xr=new E;function Q_(s,t,e){e.vsub(s,Ci);const n=Ci.dot(t);return t.scale(n,Xr),Xr.vadd(s,Xr),e.distanceTo(Xr)}class hf{static defaults(t,e){t===void 0&&(t={});for(let n in e)n in t||(t[n]=e[n]);return t}}class Do{constructor(t,e,n){n===void 0&&(n={}),n=hf.defaults(n,{collideConnected:!0,wakeUpBodies:!0}),this.equations=[],this.bodyA=t,this.bodyB=e,this.id=Do.idCounter++,this.collideConnected=n.collideConnected,n.wakeUpBodies&&(t&&t.wakeUp(),e&&e.wakeUp())}update(){throw new Error("method update() not implmemented in this Constraint subclass!")}enable(){const t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!0}disable(){const t=this.equations;for(let e=0;e<t.length;e++)t[e].enabled=!1}}Do.idCounter=0;class _h{constructor(){this.spatial=new E,this.rotational=new E}multiplyElement(t){return t.spatial.dot(this.spatial)+t.rotational.dot(this.rotational)}multiplyVectors(t,e){return t.dot(this.spatial)+e.dot(this.rotational)}}class zi{constructor(t,e,n,i){n===void 0&&(n=-1e6),i===void 0&&(i=1e6),this.id=zi.idCounter++,this.minForce=n,this.maxForce=i,this.bi=t,this.bj=e,this.a=0,this.b=0,this.eps=0,this.jacobianElementA=new _h,this.jacobianElementB=new _h,this.enabled=!0,this.multiplier=0,this.setSpookParams(1e7,4,1/60)}setSpookParams(t,e,n){const i=e,r=t,o=n;this.a=4/(o*(1+4*i)),this.b=4*i/(1+4*i),this.eps=4/(o*o*r*(1+4*i))}computeB(t,e,n){const i=this.computeGW(),r=this.computeGq(),o=this.computeGiMf();return-r*t-i*e-o*n}computeGq(){const t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.position,o=i.position;return t.spatial.dot(r)+e.spatial.dot(o)}computeGW(){const t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.velocity,o=i.velocity,a=n.angularVelocity,c=i.angularVelocity;return t.multiplyVectors(r,a)+e.multiplyVectors(o,c)}computeGWlambda(){const t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.vlambda,o=i.vlambda,a=n.wlambda,c=i.wlambda;return t.multiplyVectors(r,a)+e.multiplyVectors(o,c)}computeGiMf(){const t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.force,o=n.torque,a=i.force,c=i.torque,l=n.invMassSolve,h=i.invMassSolve;return r.scale(l,xh),a.scale(h,yh),n.invInertiaWorldSolve.vmult(o,Mh),i.invInertiaWorldSolve.vmult(c,Sh),t.multiplyVectors(xh,Mh)+e.multiplyVectors(yh,Sh)}computeGiMGt(){const t=this.jacobianElementA,e=this.jacobianElementB,n=this.bi,i=this.bj,r=n.invMassSolve,o=i.invMassSolve,a=n.invInertiaWorldSolve,c=i.invInertiaWorldSolve;let l=r+o;return a.vmult(t.rotational,Yr),l+=Yr.dot(t.rotational),c.vmult(e.rotational,Yr),l+=Yr.dot(e.rotational),l}addToWlambda(t){const e=this.jacobianElementA,n=this.jacobianElementB,i=this.bi,r=this.bj,o=tx;i.vlambda.addScaledVector(i.invMassSolve*t,e.spatial,i.vlambda),r.vlambda.addScaledVector(r.invMassSolve*t,n.spatial,r.vlambda),i.invInertiaWorldSolve.vmult(e.rotational,o),i.wlambda.addScaledVector(t,o,i.wlambda),r.invInertiaWorldSolve.vmult(n.rotational,o),r.wlambda.addScaledVector(t,o,r.wlambda)}computeC(){return this.computeGiMGt()+this.eps}}zi.idCounter=0;const xh=new E,yh=new E,Mh=new E,Sh=new E,Yr=new E,tx=new E;class _o extends zi{constructor(t,e,n){n===void 0&&(n=1e6),super(t,e,0,n),this.restitution=0,this.ri=new E,this.rj=new E,this.ni=new E}computeB(t){const e=this.a,n=this.b,i=this.bi,r=this.bj,o=this.ri,a=this.rj,c=ex,l=nx,h=i.velocity,f=i.angularVelocity;i.force,i.torque;const u=r.velocity,d=r.angularVelocity;r.force,r.torque;const m=ix,v=this.jacobianElementA,g=this.jacobianElementB,p=this.ni;o.cross(p,c),a.cross(p,l),p.negate(v.spatial),c.negate(v.rotational),g.spatial.copy(p),g.rotational.copy(l),m.copy(r.position),m.vadd(a,m),m.vsub(i.position,m),m.vsub(o,m);const _=p.dot(m),y=this.restitution+1,x=y*u.dot(p)-y*h.dot(p)+d.dot(l)-f.dot(c),C=this.computeGiMf();return-_*e-x*n-t*C}getImpactVelocityAlongNormal(){const t=sx,e=rx,n=ox,i=ax,r=cx;return this.bi.position.vadd(this.ri,n),this.bj.position.vadd(this.rj,i),this.bi.getVelocityAtWorldPoint(n,t),this.bj.getVelocityAtWorldPoint(i,e),t.vsub(e,r),this.ni.dot(r)}}const ex=new E,nx=new E,ix=new E,sx=new E,rx=new E,ox=new E,ax=new E,cx=new E;class lx extends Do{constructor(t,e,n,i,r){e===void 0&&(e=new E),i===void 0&&(i=new E),r===void 0&&(r=1e6),super(t,n),this.pivotA=e.clone(),this.pivotB=i.clone();const o=this.equationX=new _o(t,n),a=this.equationY=new _o(t,n),c=this.equationZ=new _o(t,n);this.equations.push(o,a,c),o.minForce=a.minForce=c.minForce=-r,o.maxForce=a.maxForce=c.maxForce=r,o.ni.set(1,0,0),a.ni.set(0,1,0),c.ni.set(0,0,1)}update(){const t=this.bodyA,e=this.bodyB,n=this.equationX,i=this.equationY,r=this.equationZ;t.quaternion.vmult(this.pivotA,n.ri),e.quaternion.vmult(this.pivotB,n.rj),i.ri.copy(n.ri),i.rj.copy(n.rj),r.ri.copy(n.ri),r.rj.copy(n.rj)}}class hx extends zi{constructor(t,e,n){n===void 0&&(n={});const i=typeof n.maxForce<"u"?n.maxForce:1e6;super(t,e,-i,i),this.axisA=n.axisA?n.axisA.clone():new E(1,0,0),this.axisB=n.axisB?n.axisB.clone():new E(0,1,0),this.angle=typeof n.angle<"u"?n.angle:0}computeB(t){const e=this.a,n=this.b,i=this.axisA,r=this.axisB,o=ux,a=fx,c=this.jacobianElementA,l=this.jacobianElementB;i.cross(r,o),r.cross(i,a),c.rotational.copy(a),l.rotational.copy(o);const h=Math.cos(this.angle)-i.dot(r),f=this.computeGW(),u=this.computeGiMf();return-h*e-f*n-t*u}}const ux=new E,fx=new E;class dx extends zi{constructor(t,e,n){n===void 0&&(n={});const i=typeof n.maxForce<"u"?n.maxForce:1e6;super(t,e,-i,i),this.axisA=n.axisA?n.axisA.clone():new E(1,0,0),this.axisB=n.axisB?n.axisB.clone():new E(0,1,0),this.maxAngle=Math.PI/2}computeB(t){const e=this.a,n=this.b,i=this.axisA,r=this.axisB,o=px,a=mx,c=this.jacobianElementA,l=this.jacobianElementB;i.cross(r,o),r.cross(i,a),c.rotational.copy(a),l.rotational.copy(o);const h=Math.cos(this.maxAngle)-i.dot(r),f=this.computeGW(),u=this.computeGiMf();return-h*e-f*n-t*u}}const px=new E,mx=new E;class gx extends lx{constructor(t,e,n){n===void 0&&(n={});const i=typeof n.maxForce<"u"?n.maxForce:1e6,r=n.pivotA?n.pivotA.clone():new E,o=n.pivotB?n.pivotB.clone():new E;super(t,r,e,o,i),this.axisA=n.axisA?n.axisA.clone():new E,this.axisB=n.axisB?n.axisB.clone():new E,this.collideConnected=!!n.collideConnected,this.angle=typeof n.angle<"u"?n.angle:0;const a=this.coneEquation=new hx(t,e,n),c=this.twistEquation=new dx(t,e,n);this.twistAngle=typeof n.twistAngle<"u"?n.twistAngle:0,a.maxForce=0,a.minForce=-i,c.maxForce=0,c.minForce=-i,this.equations.push(a,c)}update(){const t=this.bodyA,e=this.bodyB,n=this.coneEquation,i=this.twistEquation;super.update(),t.vectorToWorldFrame(this.axisA,n.axisA),e.vectorToWorldFrame(this.axisB,n.axisB),this.axisA.tangents(i.axisA,i.axisA),t.vectorToWorldFrame(i.axisA,i.axisA),this.axisB.tangents(i.axisB,i.axisB),e.vectorToWorldFrame(i.axisB,i.axisB),n.angle=this.angle,i.maxAngle=this.twistAngle}}new E;new E;new E;new E;new E;new E;class Eh extends zi{constructor(t,e,n){super(t,e,-n,n),this.ri=new E,this.rj=new E,this.t=new E}computeB(t){this.a;const e=this.b;this.bi,this.bj;const n=this.ri,i=this.rj,r=vx,o=_x,a=this.t;n.cross(a,r),i.cross(a,o);const c=this.jacobianElementA,l=this.jacobianElementB;a.negate(c.spatial),r.negate(c.rotational),l.spatial.copy(a),l.rotational.copy(o);const h=this.computeGW(),f=this.computeGiMf();return-h*e-t*f}}const vx=new E,_x=new E;class gr{constructor(t,e,n){n=hf.defaults(n,{friction:.3,restitution:.3,contactEquationStiffness:1e7,contactEquationRelaxation:3,frictionEquationStiffness:1e7,frictionEquationRelaxation:3}),this.id=gr.idCounter++,this.materials=[t,e],this.friction=n.friction,this.restitution=n.restitution,this.contactEquationStiffness=n.contactEquationStiffness,this.contactEquationRelaxation=n.contactEquationRelaxation,this.frictionEquationStiffness=n.frictionEquationStiffness,this.frictionEquationRelaxation=n.frictionEquationRelaxation}}gr.idCounter=0;class vr{constructor(t){t===void 0&&(t={});let e="";typeof t=="string"&&(e=t,t={}),this.name=e,this.id=vr.idCounter++,this.friction=typeof t.friction<"u"?t.friction:-1,this.restitution=typeof t.restitution<"u"?t.restitution:-1}}vr.idCounter=0;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new ve;new E;new E;new E;new E(1,0,0),new E(0,1,0),new E(0,0,1);new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;class wh extends xt{constructor(t){if(super({type:xt.types.SPHERE}),this.radius=t!==void 0?t:1,this.radius<0)throw new Error("The sphere radius cannot be negative.");this.updateBoundingSphereRadius()}calculateLocalInertia(t,e){e===void 0&&(e=new E);const n=2*t*this.radius*this.radius/5;return e.x=n,e.y=n,e.z=n,e}volume(){return 4*Math.PI*Math.pow(this.radius,3)/3}updateBoundingSphereRadius(){this.boundingSphereRadius=this.radius}calculateWorldAABB(t,e,n,i){const r=this.radius,o=["x","y","z"];for(let a=0;a<o.length;a++){const c=o[a];n[c]=t[c]-r,i[c]=t[c]+r}}}new E;new E;new E;new E;new E;new E;new E;new E;new E;class xx extends gs{constructor(t,e,n,i){if(t===void 0&&(t=1),e===void 0&&(e=1),n===void 0&&(n=1),i===void 0&&(i=8),t<0)throw new Error("The cylinder radiusTop cannot be negative.");if(e<0)throw new Error("The cylinder radiusBottom cannot be negative.");const r=i,o=[],a=[],c=[],l=[],h=[],f=Math.cos,u=Math.sin;o.push(new E(-e*u(0),-n*.5,e*f(0))),l.push(0),o.push(new E(-t*u(0),n*.5,t*f(0))),h.push(1);for(let m=0;m<r;m++){const v=2*Math.PI/r*(m+1),g=2*Math.PI/r*(m+.5);m<r-1?(o.push(new E(-e*u(v),-n*.5,e*f(v))),l.push(2*m+2),o.push(new E(-t*u(v),n*.5,t*f(v))),h.push(2*m+3),c.push([2*m,2*m+1,2*m+3,2*m+2])):c.push([2*m,2*m+1,1,0]),(r%2===1||m<r/2)&&a.push(new E(-u(g),0,f(g)))}c.push(l),a.push(new E(0,1,0));const d=[];for(let m=0;m<h.length;m++)d.push(h[h.length-m-1]);c.push(d),super({vertices:o,faces:c,axes:a}),this.type=xt.types.CYLINDER,this.radiusTop=t,this.radiusBottom=e,this.height=n,this.numSegments=i}}class yx extends xt{constructor(){super({type:xt.types.PLANE}),this.worldNormal=new E,this.worldNormalNeedsUpdate=!0,this.boundingSphereRadius=Number.MAX_VALUE}computeWorldNormal(t){const e=this.worldNormal;e.set(0,0,1),t.vmult(e,e),this.worldNormalNeedsUpdate=!1}calculateLocalInertia(t,e){return e===void 0&&(e=new E),e}volume(){return Number.MAX_VALUE}calculateWorldAABB(t,e,n,i){zn.set(0,0,1),e.vmult(zn,zn);const r=Number.MAX_VALUE;n.set(-r,-r,-r),i.set(r,r,r),zn.x===1?i.x=t.x:zn.x===-1&&(n.x=t.x),zn.y===1?i.y=t.y:zn.y===-1&&(n.y=t.y),zn.z===1?i.z=t.z:zn.z===-1&&(n.z=t.z)}updateBoundingSphereRadius(){this.boundingSphereRadius=Number.MAX_VALUE}}const zn=new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new E;new je;new E;new je;new E;new E;new E;new E;new E;new E;new E;new je;new E;new Jt;new je;class Mx{constructor(){this.equations=[]}solve(t,e){return 0}addEquation(t){t.enabled&&!t.bi.isTrigger&&!t.bj.isTrigger&&this.equations.push(t)}removeEquation(t){const e=this.equations,n=e.indexOf(t);n!==-1&&e.splice(n,1)}removeAllEquations(){this.equations.length=0}}class Sx extends Mx{constructor(){super(),this.iterations=10,this.tolerance=1e-7}solve(t,e){let n=0;const i=this.iterations,r=this.tolerance*this.tolerance,o=this.equations,a=o.length,c=e.bodies,l=c.length,h=t;let f,u,d,m,v,g;if(a!==0)for(let x=0;x!==l;x++)c[x].updateSolveMassProperties();const p=wx,_=bx,y=Ex;p.length=a,_.length=a,y.length=a;for(let x=0;x!==a;x++){const C=o[x];y[x]=0,_[x]=C.computeB(h),p[x]=1/C.computeC()}if(a!==0){for(let w=0;w!==l;w++){const T=c[w],R=T.vlambda,S=T.wlambda;R.set(0,0,0),S.set(0,0,0)}for(n=0;n!==i;n++){m=0;for(let w=0;w!==a;w++){const T=o[w];f=_[w],u=p[w],g=y[w],v=T.computeGWlambda(),d=u*(f-v-T.eps*g),g+d<T.minForce?d=T.minForce-g:g+d>T.maxForce&&(d=T.maxForce-g),y[w]+=d,m+=d>0?d:-d,T.addToWlambda(d)}if(m*m<r)break}for(let w=0;w!==l;w++){const T=c[w],R=T.velocity,S=T.angularVelocity;T.vlambda.vmul(T.linearFactor,T.vlambda),R.vadd(T.vlambda,R),T.wlambda.vmul(T.angularFactor,T.wlambda),S.vadd(T.wlambda,S)}let x=o.length;const C=1/h;for(;x--;)o[x].multiplier=y[x]*C}return n}}const Ex=[],wx=[],bx=[];class Tx{constructor(){this.objects=[],this.type=Object}release(){const t=arguments.length;for(let e=0;e!==t;e++)this.objects.push(e<0||arguments.length<=e?void 0:arguments[e]);return this}get(){return this.objects.length===0?this.constructObject():this.objects.pop()}constructObject(){throw new Error("constructObject() not implemented in this Pool subclass yet!")}resize(t){const e=this.objects;for(;e.length>t;)e.pop();for(;e.length<t;)e.push(this.constructObject());return this}}class Ax extends Tx{constructor(){super(...arguments),this.type=E}constructObject(){return new E}}const ae={sphereSphere:xt.types.SPHERE,spherePlane:xt.types.SPHERE|xt.types.PLANE,boxBox:xt.types.BOX|xt.types.BOX,sphereBox:xt.types.SPHERE|xt.types.BOX,planeBox:xt.types.PLANE|xt.types.BOX,convexConvex:xt.types.CONVEXPOLYHEDRON,sphereConvex:xt.types.SPHERE|xt.types.CONVEXPOLYHEDRON,planeConvex:xt.types.PLANE|xt.types.CONVEXPOLYHEDRON,boxConvex:xt.types.BOX|xt.types.CONVEXPOLYHEDRON,sphereHeightfield:xt.types.SPHERE|xt.types.HEIGHTFIELD,boxHeightfield:xt.types.BOX|xt.types.HEIGHTFIELD,convexHeightfield:xt.types.CONVEXPOLYHEDRON|xt.types.HEIGHTFIELD,sphereParticle:xt.types.PARTICLE|xt.types.SPHERE,planeParticle:xt.types.PLANE|xt.types.PARTICLE,boxParticle:xt.types.BOX|xt.types.PARTICLE,convexParticle:xt.types.PARTICLE|xt.types.CONVEXPOLYHEDRON,cylinderCylinder:xt.types.CYLINDER,sphereCylinder:xt.types.SPHERE|xt.types.CYLINDER,planeCylinder:xt.types.PLANE|xt.types.CYLINDER,boxCylinder:xt.types.BOX|xt.types.CYLINDER,convexCylinder:xt.types.CONVEXPOLYHEDRON|xt.types.CYLINDER,heightfieldCylinder:xt.types.HEIGHTFIELD|xt.types.CYLINDER,particleCylinder:xt.types.PARTICLE|xt.types.CYLINDER,sphereTrimesh:xt.types.SPHERE|xt.types.TRIMESH,planeTrimesh:xt.types.PLANE|xt.types.TRIMESH};class Cx{get[ae.sphereSphere](){return this.sphereSphere}get[ae.spherePlane](){return this.spherePlane}get[ae.boxBox](){return this.boxBox}get[ae.sphereBox](){return this.sphereBox}get[ae.planeBox](){return this.planeBox}get[ae.convexConvex](){return this.convexConvex}get[ae.sphereConvex](){return this.sphereConvex}get[ae.planeConvex](){return this.planeConvex}get[ae.boxConvex](){return this.boxConvex}get[ae.sphereHeightfield](){return this.sphereHeightfield}get[ae.boxHeightfield](){return this.boxHeightfield}get[ae.convexHeightfield](){return this.convexHeightfield}get[ae.sphereParticle](){return this.sphereParticle}get[ae.planeParticle](){return this.planeParticle}get[ae.boxParticle](){return this.boxParticle}get[ae.convexParticle](){return this.convexParticle}get[ae.cylinderCylinder](){return this.convexConvex}get[ae.sphereCylinder](){return this.sphereConvex}get[ae.planeCylinder](){return this.planeConvex}get[ae.boxCylinder](){return this.boxConvex}get[ae.convexCylinder](){return this.convexConvex}get[ae.heightfieldCylinder](){return this.heightfieldCylinder}get[ae.particleCylinder](){return this.particleCylinder}get[ae.sphereTrimesh](){return this.sphereTrimesh}get[ae.planeTrimesh](){return this.planeTrimesh}constructor(t){this.contactPointPool=[],this.frictionEquationPool=[],this.result=[],this.frictionResult=[],this.v3pool=new Ax,this.world=t,this.currentContactMaterial=t.defaultContactMaterial,this.enableFrictionReduction=!1}createContactEquation(t,e,n,i,r,o){let a;this.contactPointPool.length?(a=this.contactPointPool.pop(),a.bi=t,a.bj=e):a=new _o(t,e),a.enabled=t.collisionResponse&&e.collisionResponse&&n.collisionResponse&&i.collisionResponse;const c=this.currentContactMaterial;a.restitution=c.restitution,a.setSpookParams(c.contactEquationStiffness,c.contactEquationRelaxation,this.world.dt);const l=n.material||t.material,h=i.material||e.material;return l&&h&&l.restitution>=0&&h.restitution>=0&&(a.restitution=l.restitution*h.restitution),a.si=r||n,a.sj=o||i,a}createFrictionEquationsFromContact(t,e){const n=t.bi,i=t.bj,r=t.si,o=t.sj,a=this.world,c=this.currentContactMaterial;let l=c.friction;const h=r.material||n.material,f=o.material||i.material;if(h&&f&&h.friction>=0&&f.friction>=0&&(l=h.friction*f.friction),l>0){const u=l*(a.frictionGravity||a.gravity).length();let d=n.invMass+i.invMass;d>0&&(d=1/d);const m=this.frictionEquationPool,v=m.length?m.pop():new Eh(n,i,u*d),g=m.length?m.pop():new Eh(n,i,u*d);return v.bi=g.bi=n,v.bj=g.bj=i,v.minForce=g.minForce=-u*d,v.maxForce=g.maxForce=u*d,v.ri.copy(t.ri),v.rj.copy(t.rj),g.ri.copy(t.ri),g.rj.copy(t.rj),t.ni.tangents(v.t,g.t),v.setSpookParams(c.frictionEquationStiffness,c.frictionEquationRelaxation,a.dt),g.setSpookParams(c.frictionEquationStiffness,c.frictionEquationRelaxation,a.dt),v.enabled=g.enabled=t.enabled,e.push(v,g),!0}return!1}createFrictionFromAverage(t){let e=this.result[this.result.length-1];if(!this.createFrictionEquationsFromContact(e,this.frictionResult)||t===1)return;const n=this.frictionResult[this.frictionResult.length-2],i=this.frictionResult[this.frictionResult.length-1];Mi.setZero(),Qi.setZero(),ts.setZero();const r=e.bi;e.bj;for(let a=0;a!==t;a++)e=this.result[this.result.length-1-a],e.bi!==r?(Mi.vadd(e.ni,Mi),Qi.vadd(e.ri,Qi),ts.vadd(e.rj,ts)):(Mi.vsub(e.ni,Mi),Qi.vadd(e.rj,Qi),ts.vadd(e.ri,ts));const o=1/t;Qi.scale(o,n.ri),ts.scale(o,n.rj),i.ri.copy(n.ri),i.rj.copy(n.rj),Mi.normalize(),Mi.tangents(n.t,i.t)}getContacts(t,e,n,i,r,o,a){this.contactPointPool=r,this.frictionEquationPool=a,this.result=i,this.frictionResult=o;const c=Lx,l=Ix,h=Rx,f=Px;for(let u=0,d=t.length;u!==d;u++){const m=t[u],v=e[u];let g=null;m.material&&v.material&&(g=n.getContactMaterial(m.material,v.material)||null);const p=m.type&Et.KINEMATIC&&v.type&Et.STATIC||m.type&Et.STATIC&&v.type&Et.KINEMATIC||m.type&Et.KINEMATIC&&v.type&Et.KINEMATIC;for(let _=0;_<m.shapes.length;_++){m.quaternion.mult(m.shapeOrientations[_],c),m.quaternion.vmult(m.shapeOffsets[_],h),h.vadd(m.position,h);const y=m.shapes[_];for(let x=0;x<v.shapes.length;x++){v.quaternion.mult(v.shapeOrientations[x],l),v.quaternion.vmult(v.shapeOffsets[x],f),f.vadd(v.position,f);const C=v.shapes[x];if(!(y.collisionFilterMask&C.collisionFilterGroup&&C.collisionFilterMask&y.collisionFilterGroup)||h.distanceTo(f)>y.boundingSphereRadius+C.boundingSphereRadius)continue;let w=null;y.material&&C.material&&(w=n.getContactMaterial(y.material,C.material)||null),this.currentContactMaterial=w||g||n.defaultContactMaterial;const T=y.type|C.type,R=this[T];if(R){let S=!1;y.type<C.type?S=R.call(this,y,C,h,f,c,l,m,v,y,C,p):S=R.call(this,C,y,f,h,l,c,v,m,y,C,p),S&&p&&(n.shapeOverlapKeeper.set(y.id,C.id),n.bodyOverlapKeeper.set(m.id,v.id))}}}}}sphereSphere(t,e,n,i,r,o,a,c,l,h,f){if(f)return n.distanceSquared(i)<(t.radius+e.radius)**2;const u=this.createContactEquation(a,c,t,e,l,h);i.vsub(n,u.ni),u.ni.normalize(),u.ri.copy(u.ni),u.rj.copy(u.ni),u.ri.scale(t.radius,u.ri),u.rj.scale(-e.radius,u.rj),u.ri.vadd(n,u.ri),u.ri.vsub(a.position,u.ri),u.rj.vadd(i,u.rj),u.rj.vsub(c.position,u.rj),this.result.push(u),this.createFrictionEquationsFromContact(u,this.frictionResult)}spherePlane(t,e,n,i,r,o,a,c,l,h,f){const u=this.createContactEquation(a,c,t,e,l,h);if(u.ni.set(0,0,1),o.vmult(u.ni,u.ni),u.ni.negate(u.ni),u.ni.normalize(),u.ni.scale(t.radius,u.ri),n.vsub(i,$r),u.ni.scale(u.ni.dot($r),bh),$r.vsub(bh,u.rj),-$r.dot(u.ni)<=t.radius){if(f)return!0;const d=u.ri,m=u.rj;d.vadd(n,d),d.vsub(a.position,d),m.vadd(i,m),m.vsub(c.position,m),this.result.push(u),this.createFrictionEquationsFromContact(u,this.frictionResult)}}boxBox(t,e,n,i,r,o,a,c,l,h,f){return t.convexPolyhedronRepresentation.material=t.material,e.convexPolyhedronRepresentation.material=e.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e.convexPolyhedronRepresentation,n,i,r,o,a,c,t,e,f)}sphereBox(t,e,n,i,r,o,a,c,l,h,f){const u=this.v3pool,d=sy;n.vsub(i,jr),e.getSideNormals(d,o);const m=t.radius;let v=!1;const g=oy,p=ay,_=cy;let y=null,x=0,C=0,w=0,T=null;for(let D=0,Y=d.length;D!==Y&&v===!1;D++){const G=ey;G.copy(d[D]);const X=G.length();G.normalize();const tt=jr.dot(G);if(tt<X+m&&tt>0){const st=ny,J=iy;st.copy(d[(D+1)%3]),J.copy(d[(D+2)%3]);const Nt=st.length(),$=J.length();st.normalize(),J.normalize();const nt=jr.dot(st),dt=jr.dot(J);if(nt<Nt&&nt>-Nt&&dt<$&&dt>-$){const ot=Math.abs(tt-X-m);if((T===null||ot<T)&&(T=ot,C=nt,w=dt,y=X,g.copy(G),p.copy(st),_.copy(J),x++,f))return!0}}}if(x){v=!0;const D=this.createContactEquation(a,c,t,e,l,h);g.scale(-m,D.ri),D.ni.copy(g),D.ni.negate(D.ni),g.scale(y,g),p.scale(C,p),g.vadd(p,g),_.scale(w,_),g.vadd(_,D.rj),D.ri.vadd(n,D.ri),D.ri.vsub(a.position,D.ri),D.rj.vadd(i,D.rj),D.rj.vsub(c.position,D.rj),this.result.push(D),this.createFrictionEquationsFromContact(D,this.frictionResult)}let R=u.get();const S=ry;for(let D=0;D!==2&&!v;D++)for(let Y=0;Y!==2&&!v;Y++)for(let G=0;G!==2&&!v;G++)if(R.set(0,0,0),D?R.vadd(d[0],R):R.vsub(d[0],R),Y?R.vadd(d[1],R):R.vsub(d[1],R),G?R.vadd(d[2],R):R.vsub(d[2],R),i.vadd(R,S),S.vsub(n,S),S.lengthSquared()<m*m){if(f)return!0;v=!0;const X=this.createContactEquation(a,c,t,e,l,h);X.ri.copy(S),X.ri.normalize(),X.ni.copy(X.ri),X.ri.scale(m,X.ri),X.rj.copy(R),X.ri.vadd(n,X.ri),X.ri.vsub(a.position,X.ri),X.rj.vadd(i,X.rj),X.rj.vsub(c.position,X.rj),this.result.push(X),this.createFrictionEquationsFromContact(X,this.frictionResult)}u.release(R),R=null;const M=u.get(),P=u.get(),O=u.get(),I=u.get(),F=u.get(),z=d.length;for(let D=0;D!==z&&!v;D++)for(let Y=0;Y!==z&&!v;Y++)if(D%3!==Y%3){d[Y].cross(d[D],M),M.normalize(),d[D].vadd(d[Y],P),O.copy(n),O.vsub(P,O),O.vsub(i,O);const G=O.dot(M);M.scale(G,I);let X=0;for(;X===D%3||X===Y%3;)X++;F.copy(n),F.vsub(I,F),F.vsub(P,F),F.vsub(i,F);const tt=Math.abs(G),st=F.length();if(tt<d[X].length()&&st<m){if(f)return!0;v=!0;const J=this.createContactEquation(a,c,t,e,l,h);P.vadd(I,J.rj),J.rj.copy(J.rj),F.negate(J.ni),J.ni.normalize(),J.ri.copy(J.rj),J.ri.vadd(i,J.ri),J.ri.vsub(n,J.ri),J.ri.normalize(),J.ri.scale(m,J.ri),J.ri.vadd(n,J.ri),J.ri.vsub(a.position,J.ri),J.rj.vadd(i,J.rj),J.rj.vsub(c.position,J.rj),this.result.push(J),this.createFrictionEquationsFromContact(J,this.frictionResult)}}u.release(M,P,O,I,F)}planeBox(t,e,n,i,r,o,a,c,l,h,f){return e.convexPolyhedronRepresentation.material=e.material,e.convexPolyhedronRepresentation.collisionResponse=e.collisionResponse,e.convexPolyhedronRepresentation.id=e.id,this.planeConvex(t,e.convexPolyhedronRepresentation,n,i,r,o,a,c,t,e,f)}convexConvex(t,e,n,i,r,o,a,c,l,h,f,u,d){const m=Ey;if(!(n.distanceTo(i)>t.boundingSphereRadius+e.boundingSphereRadius)&&t.findSeparatingAxis(e,n,r,i,o,m,u,d)){const v=[],g=wy;t.clipAgainstHull(n,r,e,i,o,m,-100,100,v);let p=0;for(let _=0;_!==v.length;_++){if(f)return!0;const y=this.createContactEquation(a,c,t,e,l,h),x=y.ri,C=y.rj;m.negate(y.ni),v[_].normal.negate(g),g.scale(v[_].depth,g),v[_].point.vadd(g,x),C.copy(v[_].point),x.vsub(n,x),C.vsub(i,C),x.vadd(n,x),x.vsub(a.position,x),C.vadd(i,C),C.vsub(c.position,C),this.result.push(y),p++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(y,this.frictionResult)}this.enableFrictionReduction&&p&&this.createFrictionFromAverage(p)}}sphereConvex(t,e,n,i,r,o,a,c,l,h,f){const u=this.v3pool;n.vsub(i,ly);const d=e.faceNormals,m=e.faces,v=e.vertices,g=t.radius;let p=!1;for(let _=0;_!==v.length;_++){const y=v[_],x=dy;o.vmult(y,x),i.vadd(x,x);const C=fy;if(x.vsub(n,C),C.lengthSquared()<g*g){if(f)return!0;p=!0;const w=this.createContactEquation(a,c,t,e,l,h);w.ri.copy(C),w.ri.normalize(),w.ni.copy(w.ri),w.ri.scale(g,w.ri),x.vsub(i,w.rj),w.ri.vadd(n,w.ri),w.ri.vsub(a.position,w.ri),w.rj.vadd(i,w.rj),w.rj.vsub(c.position,w.rj),this.result.push(w),this.createFrictionEquationsFromContact(w,this.frictionResult);return}}for(let _=0,y=m.length;_!==y&&p===!1;_++){const x=d[_],C=m[_],w=py;o.vmult(x,w);const T=my;o.vmult(v[C[0]],T),T.vadd(i,T);const R=gy;w.scale(-g,R),n.vadd(R,R);const S=vy;R.vsub(T,S);const M=S.dot(w),P=_y;if(n.vsub(T,P),M<0&&P.dot(w)>0){const O=[];for(let I=0,F=C.length;I!==F;I++){const z=u.get();o.vmult(v[C[I]],z),i.vadd(z,z),O.push(z)}if(ty(O,w,n)){if(f)return!0;p=!0;const I=this.createContactEquation(a,c,t,e,l,h);w.scale(-g,I.ri),w.negate(I.ni);const F=u.get();w.scale(-M,F);const z=u.get();w.scale(-g,z),n.vsub(i,I.rj),I.rj.vadd(z,I.rj),I.rj.vadd(F,I.rj),I.rj.vadd(i,I.rj),I.rj.vsub(c.position,I.rj),I.ri.vadd(n,I.ri),I.ri.vsub(a.position,I.ri),u.release(F),u.release(z),this.result.push(I),this.createFrictionEquationsFromContact(I,this.frictionResult);for(let D=0,Y=O.length;D!==Y;D++)u.release(O[D]);return}else for(let I=0;I!==C.length;I++){const F=u.get(),z=u.get();o.vmult(v[C[(I+1)%C.length]],F),o.vmult(v[C[(I+2)%C.length]],z),i.vadd(F,F),i.vadd(z,z);const D=hy;z.vsub(F,D);const Y=uy;D.unit(Y);const G=u.get(),X=u.get();n.vsub(F,X);const tt=X.dot(Y);Y.scale(tt,G),G.vadd(F,G);const st=u.get();if(G.vsub(n,st),tt>0&&tt*tt<D.lengthSquared()&&st.lengthSquared()<g*g){if(f)return!0;const J=this.createContactEquation(a,c,t,e,l,h);G.vsub(i,J.rj),G.vsub(n,J.ni),J.ni.normalize(),J.ni.scale(g,J.ri),J.rj.vadd(i,J.rj),J.rj.vsub(c.position,J.rj),J.ri.vadd(n,J.ri),J.ri.vsub(a.position,J.ri),this.result.push(J),this.createFrictionEquationsFromContact(J,this.frictionResult);for(let Nt=0,$=O.length;Nt!==$;Nt++)u.release(O[Nt]);u.release(F),u.release(z),u.release(G),u.release(st),u.release(X);return}u.release(F),u.release(z),u.release(G),u.release(st),u.release(X)}for(let I=0,F=O.length;I!==F;I++)u.release(O[I])}}}planeConvex(t,e,n,i,r,o,a,c,l,h,f){const u=xy,d=yy;d.set(0,0,1),r.vmult(d,d);let m=0;const v=My;for(let g=0;g!==e.vertices.length;g++)if(u.copy(e.vertices[g]),o.vmult(u,u),i.vadd(u,u),u.vsub(n,v),d.dot(v)<=0){if(f)return!0;const _=this.createContactEquation(a,c,t,e,l,h),y=Sy;d.scale(d.dot(v),y),u.vsub(y,y),y.vsub(n,_.ri),_.ni.copy(d),u.vsub(i,_.rj),_.ri.vadd(n,_.ri),_.ri.vsub(a.position,_.ri),_.rj.vadd(i,_.rj),_.rj.vsub(c.position,_.rj),this.result.push(_),m++,this.enableFrictionReduction||this.createFrictionEquationsFromContact(_,this.frictionResult)}this.enableFrictionReduction&&m&&this.createFrictionFromAverage(m)}boxConvex(t,e,n,i,r,o,a,c,l,h,f){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexConvex(t.convexPolyhedronRepresentation,e,n,i,r,o,a,c,t,e,f)}sphereHeightfield(t,e,n,i,r,o,a,c,l,h,f){const u=e.data,d=t.radius,m=e.elementSize,v=Fy,g=Uy;Jt.pointToLocalFrame(i,o,n,g);let p=Math.floor((g.x-d)/m)-1,_=Math.ceil((g.x+d)/m)+1,y=Math.floor((g.y-d)/m)-1,x=Math.ceil((g.y+d)/m)+1;if(_<0||x<0||p>u.length||y>u[0].length)return;p<0&&(p=0),_<0&&(_=0),y<0&&(y=0),x<0&&(x=0),p>=u.length&&(p=u.length-1),_>=u.length&&(_=u.length-1),x>=u[0].length&&(x=u[0].length-1),y>=u[0].length&&(y=u[0].length-1);const C=[];e.getRectMinMax(p,y,_,x,C);const w=C[0],T=C[1];if(g.z-d>T||g.z+d<w)return;const R=this.result;for(let S=p;S<_;S++)for(let M=y;M<x;M++){const P=R.length;let O=!1;if(e.getConvexTrianglePillar(S,M,!1),Jt.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(O=this.sphereConvex(t,e.pillarConvex,n,v,r,o,a,c,t,e,f)),f&&O||(e.getConvexTrianglePillar(S,M,!0),Jt.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(O=this.sphereConvex(t,e.pillarConvex,n,v,r,o,a,c,t,e,f)),f&&O))return!0;if(R.length-P>2)return}}boxHeightfield(t,e,n,i,r,o,a,c,l,h,f){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexHeightfield(t.convexPolyhedronRepresentation,e,n,i,r,o,a,c,t,e,f)}convexHeightfield(t,e,n,i,r,o,a,c,l,h,f){const u=e.data,d=e.elementSize,m=t.boundingSphereRadius,v=Ny,g=Dy,p=Iy;Jt.pointToLocalFrame(i,o,n,p);let _=Math.floor((p.x-m)/d)-1,y=Math.ceil((p.x+m)/d)+1,x=Math.floor((p.y-m)/d)-1,C=Math.ceil((p.y+m)/d)+1;if(y<0||C<0||_>u.length||x>u[0].length)return;_<0&&(_=0),y<0&&(y=0),x<0&&(x=0),C<0&&(C=0),_>=u.length&&(_=u.length-1),y>=u.length&&(y=u.length-1),C>=u[0].length&&(C=u[0].length-1),x>=u[0].length&&(x=u[0].length-1);const w=[];e.getRectMinMax(_,x,y,C,w);const T=w[0],R=w[1];if(!(p.z-m>R||p.z+m<T))for(let S=_;S<y;S++)for(let M=x;M<C;M++){let P=!1;if(e.getConvexTrianglePillar(S,M,!1),Jt.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(P=this.convexConvex(t,e.pillarConvex,n,v,r,o,a,c,null,null,f,g,null)),f&&P||(e.getConvexTrianglePillar(S,M,!0),Jt.pointToWorldFrame(i,o,e.pillarOffset,v),n.distanceTo(v)<e.pillarConvex.boundingSphereRadius+t.boundingSphereRadius&&(P=this.convexConvex(t,e.pillarConvex,n,v,r,o,a,c,null,null,f,g,null)),f&&P))return!0}}sphereParticle(t,e,n,i,r,o,a,c,l,h,f){const u=Cy;if(u.set(0,0,1),i.vsub(n,u),u.lengthSquared()<=t.radius*t.radius){if(f)return!0;const m=this.createContactEquation(c,a,e,t,l,h);u.normalize(),m.rj.copy(u),m.rj.scale(t.radius,m.rj),m.ni.copy(u),m.ni.negate(m.ni),m.ri.set(0,0,0),this.result.push(m),this.createFrictionEquationsFromContact(m,this.frictionResult)}}planeParticle(t,e,n,i,r,o,a,c,l,h,f){const u=by;u.set(0,0,1),a.quaternion.vmult(u,u);const d=Ty;if(i.vsub(a.position,d),u.dot(d)<=0){if(f)return!0;const v=this.createContactEquation(c,a,e,t,l,h);v.ni.copy(u),v.ni.negate(v.ni),v.ri.set(0,0,0);const g=Ay;u.scale(u.dot(i),g),i.vsub(g,g),v.rj.copy(g),this.result.push(v),this.createFrictionEquationsFromContact(v,this.frictionResult)}}boxParticle(t,e,n,i,r,o,a,c,l,h,f){return t.convexPolyhedronRepresentation.material=t.material,t.convexPolyhedronRepresentation.collisionResponse=t.collisionResponse,this.convexParticle(t.convexPolyhedronRepresentation,e,n,i,r,o,a,c,t,e,f)}convexParticle(t,e,n,i,r,o,a,c,l,h,f){let u=-1;const d=Py,m=Ly;let v=null;const g=Ry;if(g.copy(i),g.vsub(n,g),r.conjugate(Th),Th.vmult(g,g),t.pointIsInside(g)){t.worldVerticesNeedsUpdate&&t.computeWorldVertices(n,r),t.worldFaceNormalsNeedsUpdate&&t.computeWorldFaceNormals(r);for(let p=0,_=t.faces.length;p!==_;p++){const y=[t.worldVertices[t.faces[p][0]]],x=t.worldFaceNormals[p];i.vsub(y[0],Ah);const C=-x.dot(Ah);if(v===null||Math.abs(C)<Math.abs(v)){if(f)return!0;v=C,u=p,d.copy(x)}}if(u!==-1){const p=this.createContactEquation(c,a,e,t,l,h);d.scale(v,m),m.vadd(i,m),m.vsub(n,m),p.rj.copy(m),d.negate(p.ni),p.ri.set(0,0,0);const _=p.ri,y=p.rj;_.vadd(i,_),_.vsub(c.position,_),y.vadd(n,y),y.vsub(a.position,y),this.result.push(p),this.createFrictionEquationsFromContact(p,this.frictionResult)}else console.warn("Point found inside convex, but did not find penetrating face!")}}heightfieldCylinder(t,e,n,i,r,o,a,c,l,h,f){return this.convexHeightfield(e,t,i,n,o,r,c,a,l,h,f)}particleCylinder(t,e,n,i,r,o,a,c,l,h,f){return this.convexParticle(e,t,i,n,o,r,c,a,l,h,f)}sphereTrimesh(t,e,n,i,r,o,a,c,l,h,f){const u=kx,d=Vx,m=Gx,v=Hx,g=Wx,p=qx,_=jx,y=Bx,x=zx,C=Zx;Jt.pointToLocalFrame(i,o,n,g);const w=t.radius;_.lowerBound.set(g.x-w,g.y-w,g.z-w),_.upperBound.set(g.x+w,g.y+w,g.z+w),e.getTrianglesInAABB(_,C);const T=Ox,R=t.radius*t.radius;for(let I=0;I<C.length;I++)for(let F=0;F<3;F++)if(e.getVertex(e.indices[C[I]*3+F],T),T.vsub(g,x),x.lengthSquared()<=R){if(y.copy(T),Jt.pointToWorldFrame(i,o,y,T),T.vsub(n,x),f)return!0;let z=this.createContactEquation(a,c,t,e,l,h);z.ni.copy(x),z.ni.normalize(),z.ri.copy(z.ni),z.ri.scale(t.radius,z.ri),z.ri.vadd(n,z.ri),z.ri.vsub(a.position,z.ri),z.rj.copy(T),z.rj.vsub(c.position,z.rj),this.result.push(z),this.createFrictionEquationsFromContact(z,this.frictionResult)}for(let I=0;I<C.length;I++)for(let F=0;F<3;F++){e.getVertex(e.indices[C[I]*3+F],u),e.getVertex(e.indices[C[I]*3+(F+1)%3],d),d.vsub(u,m),g.vsub(d,p);const z=p.dot(m);g.vsub(u,p);let D=p.dot(m);if(D>0&&z<0&&(g.vsub(u,p),v.copy(m),v.normalize(),D=p.dot(v),v.scale(D,p),p.vadd(u,p),p.distanceTo(g)<t.radius)){if(f)return!0;const G=this.createContactEquation(a,c,t,e,l,h);p.vsub(g,G.ni),G.ni.normalize(),G.ni.scale(t.radius,G.ri),G.ri.vadd(n,G.ri),G.ri.vsub(a.position,G.ri),Jt.pointToWorldFrame(i,o,p,p),p.vsub(c.position,G.rj),Jt.vectorToWorldFrame(o,G.ni,G.ni),Jt.vectorToWorldFrame(o,G.ri,G.ri),this.result.push(G),this.createFrictionEquationsFromContact(G,this.frictionResult)}}const S=Xx,M=Yx,P=$x,O=Fx;for(let I=0,F=C.length;I!==F;I++){e.getTriangleVertices(C[I],S,M,P),e.getNormal(C[I],O),g.vsub(S,p);let z=p.dot(O);if(O.scale(z,p),g.vsub(p,p),z=p.distanceTo(g),ve.pointInTriangle(p,S,M,P)&&z<t.radius){if(f)return!0;let D=this.createContactEquation(a,c,t,e,l,h);p.vsub(g,D.ni),D.ni.normalize(),D.ni.scale(t.radius,D.ri),D.ri.vadd(n,D.ri),D.ri.vsub(a.position,D.ri),Jt.pointToWorldFrame(i,o,p,p),p.vsub(c.position,D.rj),Jt.vectorToWorldFrame(o,D.ni,D.ni),Jt.vectorToWorldFrame(o,D.ri,D.ri),this.result.push(D),this.createFrictionEquationsFromContact(D,this.frictionResult)}}C.length=0}planeTrimesh(t,e,n,i,r,o,a,c,l,h,f){const u=new E,d=Nx;d.set(0,0,1),r.vmult(d,d);for(let m=0;m<e.vertices.length/3;m++){e.getVertex(m,u);const v=new E;v.copy(u),Jt.pointToWorldFrame(i,o,v,u);const g=Dx;if(u.vsub(n,g),d.dot(g)<=0){if(f)return!0;const _=this.createContactEquation(a,c,t,e,l,h);_.ni.copy(d);const y=Ux;d.scale(g.dot(d),y),u.vsub(y,y),_.ri.copy(y),_.ri.vsub(a.position,_.ri),_.rj.copy(u),_.rj.vsub(c.position,_.rj),this.result.push(_),this.createFrictionEquationsFromContact(_,this.frictionResult)}}}}const Mi=new E,Qi=new E,ts=new E,Rx=new E,Px=new E,Lx=new _e,Ix=new _e,Nx=new E,Dx=new E,Ux=new E,Fx=new E,zx=new E;new E;const Ox=new E,Bx=new E,kx=new E,Vx=new E,Gx=new E,Hx=new E,Wx=new E,qx=new E,Xx=new E,Yx=new E,$x=new E,jx=new je,Zx=[],$r=new E,bh=new E,Kx=new E,Jx=new E,Qx=new E;function ty(s,t,e){let n=null;const i=s.length;for(let r=0;r!==i;r++){const o=s[r],a=Kx;s[(r+1)%i].vsub(o,a);const c=Jx;a.cross(t,c);const l=Qx;e.vsub(o,l);const h=c.dot(l);if(n===null||h>0&&n===!0||h<=0&&n===!1){n===null&&(n=h>0);continue}else return!1}return!0}const jr=new E,ey=new E,ny=new E,iy=new E,sy=[new E,new E,new E,new E,new E,new E],ry=new E,oy=new E,ay=new E,cy=new E,ly=new E,hy=new E,uy=new E,fy=new E,dy=new E,py=new E,my=new E,gy=new E,vy=new E,_y=new E;new E;new E;const xy=new E,yy=new E,My=new E,Sy=new E,Ey=new E,wy=new E,by=new E,Ty=new E,Ay=new E,Cy=new E,Th=new _e,Ry=new E;new E;const Py=new E,Ah=new E,Ly=new E,Iy=new E,Ny=new E,Dy=[0],Uy=new E,Fy=new E;class Ch{constructor(){this.current=[],this.previous=[]}getKey(t,e){if(e<t){const n=e;e=t,t=n}return t<<16|e}set(t,e){const n=this.getKey(t,e),i=this.current;let r=0;for(;n>i[r];)r++;if(n!==i[r]){for(let o=i.length-1;o>=r;o--)i[o+1]=i[o];i[r]=n}}tick(){const t=this.current;this.current=this.previous,this.previous=t,this.current.length=0}getDiff(t,e){const n=this.current,i=this.previous,r=n.length,o=i.length;let a=0;for(let c=0;c<r;c++){let l=!1;const h=n[c];for(;h>i[a];)a++;l=h===i[a],l||Rh(t,h)}a=0;for(let c=0;c<o;c++){let l=!1;const h=i[c];for(;h>n[a];)a++;l=n[a]===h,l||Rh(e,h)}}}function Rh(s,t){s.push((t&4294901760)>>16,t&65535)}const Ea=(s,t)=>s<t?`${s}-${t}`:`${t}-${s}`;class zy{constructor(){this.data={keys:[]}}get(t,e){const n=Ea(t,e);return this.data[n]}set(t,e,n){const i=Ea(t,e);this.get(t,e)||this.data.keys.push(i),this.data[i]=n}delete(t,e){const n=Ea(t,e),i=this.data.keys.indexOf(n);i!==-1&&this.data.keys.splice(i,1),delete this.data[n]}reset(){const t=this.data,e=t.keys;for(;e.length>0;){const n=e.pop();delete t[n]}}}class Oy extends ef{constructor(t){t===void 0&&(t={}),super(),this.dt=-1,this.allowSleep=!!t.allowSleep,this.contacts=[],this.frictionEquations=[],this.quatNormalizeSkip=t.quatNormalizeSkip!==void 0?t.quatNormalizeSkip:0,this.quatNormalizeFast=t.quatNormalizeFast!==void 0?t.quatNormalizeFast:!1,this.time=0,this.stepnumber=0,this.default_dt=1/60,this.nextId=0,this.gravity=new E,t.gravity&&this.gravity.copy(t.gravity),t.frictionGravity&&(this.frictionGravity=new E,this.frictionGravity.copy(t.frictionGravity)),this.broadphase=t.broadphase!==void 0?t.broadphase:new z_,this.bodies=[],this.hasActiveBodies=!1,this.solver=t.solver!==void 0?t.solver:new Sx,this.constraints=[],this.narrowphase=new Cx(this),this.collisionMatrix=new dh,this.collisionMatrixPrevious=new dh,this.bodyOverlapKeeper=new Ch,this.shapeOverlapKeeper=new Ch,this.contactmaterials=[],this.contactMaterialTable=new zy,this.defaultMaterial=new vr("default"),this.defaultContactMaterial=new gr(this.defaultMaterial,this.defaultMaterial,{friction:.3,restitution:0}),this.doProfiling=!1,this.profile={solve:0,makeContactConstraints:0,broadphase:0,integrate:0,narrowphase:0},this.accumulator=0,this.subsystems=[],this.addBodyEvent={type:"addBody",body:null},this.removeBodyEvent={type:"removeBody",body:null},this.idToBodyMap={},this.broadphase.setWorld(this)}getContactMaterial(t,e){return this.contactMaterialTable.get(t.id,e.id)}collisionMatrixTick(){const t=this.collisionMatrixPrevious;this.collisionMatrixPrevious=this.collisionMatrix,this.collisionMatrix=t,this.collisionMatrix.reset(),this.bodyOverlapKeeper.tick(),this.shapeOverlapKeeper.tick()}addConstraint(t){this.constraints.push(t)}removeConstraint(t){const e=this.constraints.indexOf(t);e!==-1&&this.constraints.splice(e,1)}rayTest(t,e,n){n instanceof Eo?this.raycastClosest(t,e,{skipBackfaces:!0},n):this.raycastAll(t,e,{skipBackfaces:!0},n)}raycastAll(t,e,n,i){return n===void 0&&(n={}),n.mode=ve.ALL,n.from=t,n.to=e,n.callback=i,wa.intersectWorld(this,n)}raycastAny(t,e,n,i){return n===void 0&&(n={}),n.mode=ve.ANY,n.from=t,n.to=e,n.result=i,wa.intersectWorld(this,n)}raycastClosest(t,e,n,i){return n===void 0&&(n={}),n.mode=ve.CLOSEST,n.from=t,n.to=e,n.result=i,wa.intersectWorld(this,n)}addBody(t){this.bodies.includes(t)||(t.index=this.bodies.length,this.bodies.push(t),t.world=this,t.initPosition.copy(t.position),t.initVelocity.copy(t.velocity),t.timeLastSleepy=this.time,t instanceof Et&&(t.initAngularVelocity.copy(t.angularVelocity),t.initQuaternion.copy(t.quaternion)),this.collisionMatrix.setNumObjects(this.bodies.length),this.addBodyEvent.body=t,this.idToBodyMap[t.id]=t,this.dispatchEvent(this.addBodyEvent))}removeBody(t){t.world=null;const e=this.bodies.length-1,n=this.bodies,i=n.indexOf(t);if(i!==-1){n.splice(i,1);for(let r=0;r!==n.length;r++)n[r].index=r;this.collisionMatrix.setNumObjects(e),this.removeBodyEvent.body=t,delete this.idToBodyMap[t.id],this.dispatchEvent(this.removeBodyEvent)}}getBodyById(t){return this.idToBodyMap[t]}getShapeById(t){const e=this.bodies;for(let n=0;n<e.length;n++){const i=e[n].shapes;for(let r=0;r<i.length;r++){const o=i[r];if(o.id===t)return o}}return null}addContactMaterial(t){this.contactmaterials.push(t),this.contactMaterialTable.set(t.materials[0].id,t.materials[1].id,t)}removeContactMaterial(t){const e=this.contactmaterials.indexOf(t);e!==-1&&(this.contactmaterials.splice(e,1),this.contactMaterialTable.delete(t.materials[0].id,t.materials[1].id))}fixedStep(t,e){t===void 0&&(t=1/60),e===void 0&&(e=10);const n=Me.now()/1e3;if(!this.lastCallTime)this.step(t,void 0,e);else{const i=n-this.lastCallTime;this.step(t,i,e)}this.lastCallTime=n}step(t,e,n){if(n===void 0&&(n=10),e===void 0)this.internalStep(t),this.time+=t;else{this.accumulator+=e;const i=Me.now();let r=0;for(;this.accumulator>=t&&r<n&&(this.internalStep(t),this.accumulator-=t,r++,!(Me.now()-i>t*1e3)););this.accumulator=this.accumulator%t;const o=this.accumulator/t;for(let a=0;a!==this.bodies.length;a++){const c=this.bodies[a];c.previousPosition.lerp(c.position,o,c.interpolatedPosition),c.previousQuaternion.slerp(c.quaternion,o,c.interpolatedQuaternion),c.previousQuaternion.normalize()}this.time+=e}}internalStep(t){this.dt=t;const e=this.contacts,n=Hy,i=Wy,r=this.bodies.length,o=this.bodies,a=this.solver,c=this.gravity,l=this.doProfiling,h=this.profile,f=Et.DYNAMIC;let u=-1/0;const d=this.constraints,m=Gy;c.length();const v=c.x,g=c.y,p=c.z;let _=0;for(l&&(u=Me.now()),_=0;_!==r;_++){const I=o[_];if(I.type===f){const F=I.force,z=I.mass;F.x+=z*v,F.y+=z*g,F.z+=z*p}}for(let I=0,F=this.subsystems.length;I!==F;I++)this.subsystems[I].update();l&&(u=Me.now()),n.length=0,i.length=0,this.broadphase.collisionPairs(this,n,i),l&&(h.broadphase=Me.now()-u);let y=d.length;for(_=0;_!==y;_++){const I=d[_];if(!I.collideConnected)for(let F=n.length-1;F>=0;F-=1)(I.bodyA===n[F]&&I.bodyB===i[F]||I.bodyB===n[F]&&I.bodyA===i[F])&&(n.splice(F,1),i.splice(F,1))}this.collisionMatrixTick(),l&&(u=Me.now());const x=Vy,C=e.length;for(_=0;_!==C;_++)x.push(e[_]);e.length=0;const w=this.frictionEquations.length;for(_=0;_!==w;_++)m.push(this.frictionEquations[_]);for(this.frictionEquations.length=0,this.narrowphase.getContacts(n,i,this,e,x,this.frictionEquations,m),l&&(h.narrowphase=Me.now()-u),l&&(u=Me.now()),_=0;_<this.frictionEquations.length;_++)a.addEquation(this.frictionEquations[_]);const T=e.length;for(let I=0;I!==T;I++){const F=e[I],z=F.bi,D=F.bj,Y=F.si,G=F.sj;let X;if(z.material&&D.material?X=this.getContactMaterial(z.material,D.material)||this.defaultContactMaterial:X=this.defaultContactMaterial,X.friction,z.material&&D.material&&(z.material.friction>=0&&D.material.friction>=0&&z.material.friction*D.material.friction,z.material.restitution>=0&&D.material.restitution>=0&&(F.restitution=z.material.restitution*D.material.restitution)),a.addEquation(F),z.allowSleep&&z.type===Et.DYNAMIC&&z.sleepState===Et.SLEEPING&&D.sleepState===Et.AWAKE&&D.type!==Et.STATIC){const tt=D.velocity.lengthSquared()+D.angularVelocity.lengthSquared(),st=D.sleepSpeedLimit**2;tt>=st*2&&(z.wakeUpAfterNarrowphase=!0)}if(D.allowSleep&&D.type===Et.DYNAMIC&&D.sleepState===Et.SLEEPING&&z.sleepState===Et.AWAKE&&z.type!==Et.STATIC){const tt=z.velocity.lengthSquared()+z.angularVelocity.lengthSquared(),st=z.sleepSpeedLimit**2;tt>=st*2&&(D.wakeUpAfterNarrowphase=!0)}this.collisionMatrix.set(z,D,!0),this.collisionMatrixPrevious.get(z,D)||(Xs.body=D,Xs.contact=F,z.dispatchEvent(Xs),Xs.body=z,D.dispatchEvent(Xs)),this.bodyOverlapKeeper.set(z.id,D.id),this.shapeOverlapKeeper.set(Y.id,G.id)}for(this.emitContactEvents(),l&&(h.makeContactConstraints=Me.now()-u,u=Me.now()),_=0;_!==r;_++){const I=o[_];I.wakeUpAfterNarrowphase&&(I.wakeUp(),I.wakeUpAfterNarrowphase=!1)}for(y=d.length,_=0;_!==y;_++){const I=d[_];I.update();for(let F=0,z=I.equations.length;F!==z;F++){const D=I.equations[F];a.addEquation(D)}}a.solve(t,this),l&&(h.solve=Me.now()-u),a.removeAllEquations();const R=Math.pow;for(_=0;_!==r;_++){const I=o[_];if(I.type&f){const F=R(1-I.linearDamping,t),z=I.velocity;z.scale(F,z);const D=I.angularVelocity;if(D){const Y=R(1-I.angularDamping,t);D.scale(Y,D)}}}this.dispatchEvent(ky),l&&(u=Me.now());const M=this.stepnumber%(this.quatNormalizeSkip+1)===0,P=this.quatNormalizeFast;for(_=0;_!==r;_++)o[_].integrate(t,M,P);this.clearForces(),this.broadphase.dirty=!0,l&&(h.integrate=Me.now()-u),this.stepnumber+=1,this.dispatchEvent(By);let O=!0;if(this.allowSleep)for(O=!1,_=0;_!==r;_++){const I=o[_];I.sleepTick(this.time),I.sleepState!==Et.SLEEPING&&(O=!0)}this.hasActiveBodies=O}emitContactEvents(){const t=this.hasAnyEventListener("beginContact"),e=this.hasAnyEventListener("endContact");if((t||e)&&this.bodyOverlapKeeper.getDiff(On,Bn),t){for(let r=0,o=On.length;r<o;r+=2)Ys.bodyA=this.getBodyById(On[r]),Ys.bodyB=this.getBodyById(On[r+1]),this.dispatchEvent(Ys);Ys.bodyA=Ys.bodyB=null}if(e){for(let r=0,o=Bn.length;r<o;r+=2)$s.bodyA=this.getBodyById(Bn[r]),$s.bodyB=this.getBodyById(Bn[r+1]),this.dispatchEvent($s);$s.bodyA=$s.bodyB=null}On.length=Bn.length=0;const n=this.hasAnyEventListener("beginShapeContact"),i=this.hasAnyEventListener("endShapeContact");if((n||i)&&this.shapeOverlapKeeper.getDiff(On,Bn),n){for(let r=0,o=On.length;r<o;r+=2){const a=this.getShapeById(On[r]),c=this.getShapeById(On[r+1]);kn.shapeA=a,kn.shapeB=c,a&&(kn.bodyA=a.body),c&&(kn.bodyB=c.body),this.dispatchEvent(kn)}kn.bodyA=kn.bodyB=kn.shapeA=kn.shapeB=null}if(i){for(let r=0,o=Bn.length;r<o;r+=2){const a=this.getShapeById(Bn[r]),c=this.getShapeById(Bn[r+1]);Vn.shapeA=a,Vn.shapeB=c,a&&(Vn.bodyA=a.body),c&&(Vn.bodyB=c.body),this.dispatchEvent(Vn)}Vn.bodyA=Vn.bodyB=Vn.shapeA=Vn.shapeB=null}}clearForces(){const t=this.bodies,e=t.length;for(let n=0;n!==e;n++){const i=t[n];i.force,i.torque,i.force.set(0,0,0),i.torque.set(0,0,0)}}}new je;const wa=new ve,Me=globalThis.performance||{};if(!Me.now){let s=Date.now();Me.timing&&Me.timing.navigationStart&&(s=Me.timing.navigationStart),Me.now=()=>Date.now()-s}new E;const By={type:"postStep"},ky={type:"preStep"},Xs={type:Et.COLLIDE_EVENT_NAME,body:null,contact:null},Vy=[],Gy=[],Hy=[],Wy=[],On=[],Bn=[],Ys={type:"beginContact",bodyA:null,bodyB:null},$s={type:"endContact",bodyA:null,bodyB:null},kn={type:"beginShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},Vn={type:"endShapeContact",bodyA:null,bodyB:null,shapeA:null,shapeB:null},Us=`
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x),
             mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
`,qy=`
float fbm3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v / 0.875;
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
`;function Sn(s){let t=s>>>0;const e=()=>{t=t+1831565813>>>0;let n=t;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296};return e.range=(n,i)=>n+e()*(i-n),e.pick=n=>n[Math.floor(e()*n.length)],e}const Li=28,Ts=15,ba=2.2,Xy=1,Zr={x:-12,z:9},Yy=[];for(const s of[3.2,-2.4])for(const t of[-8,-4.5,-1,2.5,6])Yy.push({x:t,z:s});const Ph=[[-10.5,.4],[9,.4],[4.5,11.5],[-7,11.5],[-14.5,10.5],[0,-7]];(()=>{const s=Sn(1337),t=[];for(const i of[-9,-12.5,-16,-19.5])for(let r=-20;r<=20;r+=3.3)s()<.22||t.push({x:r+s.range(-.6,.6),z:i+s.range(-.5,.5),kind:s.pick(["round","round","cross","obelisk","slab"]),h:s.range(.8,1.45),w:s.range(.55,.8),rx:s.range(-.18,.12),rz:s.range(-.2,.2),ry:s.range(-.2,.2),seed:Math.floor(s()*1e6)});for(const[i,r]of[[-17,1],[-19,-3],[15,2],[17.5,-2],[13,-5]])t.push({x:i,z:r,kind:s.pick(["round","cross","slab"]),h:s.range(.8,1.3),w:.65,rx:s.range(-.15,.1),rz:s.range(-.2,.2),ry:0,seed:Math.floor(s()*1e6)});const e=[[-22,-14],[21,-19],[-24,4],[23,5],[16,-11],[-11,-24],[24,22],[-23,22],[8,-25],[-3,24]].map(([i,r])=>({x:i,z:r,seed:Math.floor(s()*1e6),h:s.range(5,8)}));return{stones:t,trees:e,shed:{x:-17,z:12,hx:2.2,hy:1.6,hz:1.7}}})();const Ni=new U(-.35,.55,-.75).normalize(),$y=new U(.94,0,.34).normalize(),jy=2.35,Zy="#120d1a",Uo={value:0},Lh=s=>`vec3(${s.x.toFixed(4)}, ${s.y.toFixed(4)}, ${s.z.toFixed(4)})`,Ih=(s,t,e)=>{const n=Math.min(1,Math.max(0,(e-s)/(t-s)));return n*n*(3-2*n)},Ky=s=>Math.min(1,Math.max(0,s));function dn(s,t,e,n=Uo.value){return n=Ky(n),n<.5?s+(t-s)*Ih(0,.5,n):t+(e-t)*Ih(.5,1,n)}const Jy=[new zt,new zt,new zt];function Qy(s,t,e){const[n,i,r]=s.map((o,a)=>Jy[a].set(o));return e.setRGB(dn(n.r,i.r,r.r,t),dn(n.g,i.g,r.g,t),dn(n.b,i.b,r.b,t))}const Ta={dark:[[.3,.26,.5],[.36,.25,.52],[.6,.58,.78]],mid:[[.58,.56,.86],[.78,.52,.66],[.92,.88,.92]],lit:[[.92,.96,1.12],[1.32,.82,.5],[1.3,1.2,1]]},Aa=s=>`day3(vec3(${s[0].join(", ")}), vec3(${s[1].join(", ")}), vec3(${s[2].join(", ")}))`;new U,new zt,new zt;new U;const Fo=`
#ifndef XIOM_DAY
#define XIOM_DAY
uniform float uDay;
const vec3 MOON = ${Lh(Ni)};
const vec3 SUN_AZ = ${Lh($y)};
float dayK() { return clamp(uDay, 0.0, 1.0); }
float day3(float n, float d, float y) { float k = dayK(); return k < 0.5 ? mix(n, d, smoothstep(0.0, 0.5, k)) : mix(d, y, smoothstep(0.5, 1.0, k)); }
vec3 day3(vec3 n, vec3 d, vec3 y) { float k = dayK(); return k < 0.5 ? mix(n, d, smoothstep(0.0, 0.5, k)) : mix(d, y, smoothstep(0.5, 1.0, k)); }
// how much surfaces wear their daytime colors (dusk is mostly a change of light, not of paint)
float dayPaint() { return smoothstep(0.35, 0.9, dayK()); }
// 1 at dusk/dawn, 0 at full night and full day
float duskAmt() { return 1.0 - abs(dayK() * 2.0 - 1.0); }
float lampsOn() { return 1.0 - smoothstep(0.45, 0.8, dayK()); }
vec3 sunDir() {
  float e = -0.08 + 0.8 * smoothstep(0.25, 1.0, dayK());
  return vec3(SUN_AZ.x * cos(e), sin(e), SUN_AZ.z * cos(e));
}
vec3 keyDir() {
  vec3 s = sunDir();
  s.y = max(s.y, 0.16);
  return normalize(mix(MOON, normalize(s), smoothstep(0.2, 0.55, dayK())));
}
#endif
`,zo=`
${Fo}
const int NL = ${Ph.length};
const vec3 LANTERN[NL] = vec3[](${Ph.map(([s,t])=>`vec3(${s.toFixed(2)}, ${jy.toFixed(2)}, ${t.toFixed(2)})`).join(", ")});
vec3 lanternLight(vec3 w, vec3 N) {
  float on = lampsOn();
  if (on <= 0.0) return vec3(0.0);
  float g = 0.0;
  for (int i = 0; i < NL; i++) {
    vec3 d = LANTERN[i] - w;
    float r2 = dot(d, d);
    float att = 1.0 / (1.0 + r2 * 0.16) * smoothstep(13.0, 4.0, sqrt(r2));
    float wrap = clamp(dot(N, d * inversesqrt(r2 + 1e-4)) * 0.6 + 0.4, 0.0, 1.0);
    g += att * wrap;
  }
  // two soft steps so lantern pools read as painted shapes, not a smooth gradient
  float q = smoothstep(0.05, 0.11, g) * 0.35 + smoothstep(0.22, 0.34, g) * 0.4 + g * 0.6;
  return vec3(1.0, 0.6, 0.26) * q * 1.7 * on;
}
vec3 toonShadeRim(vec3 base, vec3 N, vec3 w, float rimK) {
  float d = dot(N, keyDir());
  float lit = smoothstep(0.36, 0.44, d);
  float mid = smoothstep(-0.16, -0.08, d);
  // shadows go purple (cool lavender by day) instead of just darker
  vec3 light = mix(${Aa(Ta.dark)}, ${Aa(Ta.mid)}, mid);
  light = mix(light, ${Aa(Ta.lit)}, lit);
  vec3 V = normalize(cameraPosition - w);
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0) * (0.35 + 0.65 * mid);
  vec3 rimCol = (base * 1.1 + 0.035) * day3(vec3(0.62, 0.74, 1.25), vec3(1.1, 0.62, 0.6), vec3(0.62, 0.6, 0.55));
  return base * (light + lanternLight(w, N)) + rim * rimK * rimCol;
}
vec3 toonShade(vec3 base, vec3 N, vec3 w) { return toonShadeRim(base, N, w, 1.0); }
`,t1=`
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_vertex>
void main() {
  mat4 mm = modelMatrix;
  #ifdef USE_INSTANCING
  mm = modelMatrix * instanceMatrix;
  #endif
  // vO: position in the mesh's own space, in meters (scale applied), so patterns keep a real-world size
  vO = position * vec3(length(mm[0].xyz), length(mm[1].xyz), length(mm[2].xyz));
  vec4 w = mm * vec4(position, 1.0); vW = w.xyz;
  // inverse-transpose for non-uniform scale: n / scale^2 per axis, then rotate
  vec3 s2 = vec3(dot(mm[0].xyz, mm[0].xyz), dot(mm[1].xyz, mm[1].xyz), dot(mm[2].xyz, mm[2].xyz));
  vN = normalize(mat3(mm) * (normal / s2));
  vec4 mvPosition = viewMatrix * w;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`,e1=`
uniform vec3 uColor; uniform vec3 uColor2; uniform vec3 uGradColor; uniform vec2 uGradY;
uniform float uStripes; uniform float uStripeDuty; uniform int uAxis;
uniform float uEmissive; uniform float uMottle; uniform float uRim; uniform float uLamp;
uniform vec3 uDayColor; uniform float uDayMix;
varying vec3 vN; varying vec3 vW; varying vec3 vO;
#include <common>
#include <fog_pars_fragment>
${Us}
${zo}
void main() {
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 base = uColor;
  if (uDayMix > 0.0) base = mix(base, uDayColor, uDayMix * dayPaint());
  if (uStripes > 0.0) {
    float c = (uAxis == 0 ? vO.y : (uAxis == 1 ? vO.x : vO.z)) * uStripes;
    float aa = max(fwidth(c), 1e-4); // fwidth is 0 on faces perpendicular to the stripe axis
    float s = smoothstep(-aa, aa, abs(fract(c) - 0.5) - (0.5 - uStripeDuty * 0.5));
    s = mix(s, uStripeDuty, smoothstep(0.35, 0.7, aa)); // too dense to resolve: fade to the average
    base = mix(uColor, uColor2, s);
  }
  if (uGradY.y > uGradY.x) base = mix(uGradColor, base, smoothstep(uGradY.x, uGradY.y, vO.y));
  if (uMottle > 0.0) {
    float n = vnoise(vO.xz * 7.0 + vO.y * 4.3) * 0.65 + vnoise(vO.xy * 19.0 + vO.z * 11.0) * 0.35;
    base *= 1.0 + uMottle * (n - 0.5) * 1.2;
  }
  float em = uEmissive;
  if (uLamp > 0.0) { float on = lampsOn(); em *= on; base *= mix(0.4, 1.0, on); } // lamps go out by day
  vec3 col = mix(toonShadeRim(base, N, vW, uRim), base, em);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,Ca=new Map;function Ii(s,t={}){const e=JSON.stringify([s,t]);if(Ca.has(e))return Ca.get(e);const n=new Ie({uniforms:Lo.merge([ft.fog,{uColor:{value:new zt(s)},uColor2:{value:new zt(t.color2||s)},uGradColor:{value:new zt(t.gradColor||s)},uGradY:{value:new ct(...t.gradColor?t.gradY||[0,1]:[0,0])},uStripes:{value:t.stripes||0},uStripeDuty:{value:t.stripeDuty??.5},uAxis:{value:t.axis||0},uEmissive:{value:t.emissive||0},uMottle:{value:t.mottle||0},uRim:{value:t.rim??1},uLamp:{value:t.lamp?1:0},uDayColor:{value:new zt(t.dayColor||s)},uDayMix:{value:t.dayColor?1:0}}]),vertexShader:t1,fragmentShader:e1,fog:!0,side:t.side||Yn});return n.uniforms.uDay=Uo,Ca.set(e,n),n}const n1=`
uniform float uThick;
#include <common>
#include <fog_pars_vertex>
void main() {
  mat4 mv = modelViewMatrix;
  #ifdef USE_INSTANCING
  mv = modelViewMatrix * instanceMatrix;
  #endif
  vec3 s2 = vec3(dot(mv[0].xyz, mv[0].xyz), dot(mv[1].xyz, mv[1].xyz), dot(mv[2].xyz, mv[2].xyz));
  vec3 n = normalize(mat3(mv) * (normal / s2));
  vec4 mvPosition = mv * vec4(position, 1.0);
  mvPosition.xyz += n * uThick * clamp(-mvPosition.z * 0.22, 0.75, 2.6);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`,i1=`
uniform vec3 uInk;
#include <common>
#include <fog_pars_fragment>
void main() {
  gl_FragColor = vec4(uInk, 1.0);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`,Ra=new Map;function s1(s=.02){if(Ra.has(s))return Ra.get(s);const t=new Ie({uniforms:Lo.merge([ft.fog,{uThick:{value:s},uInk:{value:new zt(Zy)}}]),vertexShader:n1,fragmentShader:i1,side:Ae,fog:!0});return Ra.set(s,t),t}function r1(s,t=1){return new Ie({uniforms:{uColor:{value:new zt(s)},uStrength:{value:t}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`uniform vec3 uColor; uniform float uStrength; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2) * uStrength; gl_FragColor = vec4(uColor * a, a); }`,transparent:!0,depthWrite:!1,blending:za})}const o1=.15,a1=.075;function c1(s=new zt("#2a2344")){const t=s.getRGB({r:0,g:0,b:0},Ue),e=new Ie({uniforms:{uTime:{value:0},uMoon:{value:Ni.clone()},uHorizon:{value:new U(t.r,t.g,t.b)},uDay:Uo},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform float uTime; uniform vec3 uMoon; uniform vec3 uHorizon;
      varying vec3 vDir;
      ${Us}
      ${qy}
      ${Fo}
      const float MR = ${o1.toFixed(4)};
      const float SR = ${a1.toFixed(4)};

      // Storybook clouds are unions of round lobes, not noise fluff. Lobes sit on a jittered grid; a slow,
      // stretched noise decides which cells belong to a cloud bank and how big their lobe is. Returns the
      // signed distance (positive inside) and, for the winning lobe, its center offset and radius.
      float bankAt(vec2 c) { return vnoise(c * vec2(0.16, 0.34) + 11.0) * 0.75 + vnoise(c * 0.6 + 3.0) * 0.25; }
      vec4 lobes(vec2 p, float scale, float thr, out float rad) {
        p *= scale;
        vec2 g = floor(p);
        vec4 best = vec4(-9.0, 0.0, 0.0, 0.0);
        rad = 1.0;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 c = g + vec2(i, j);
          vec2 ctr = c + 0.15 + 0.7 * hash22(c + scale);
          float b = smoothstep(thr, thr + 0.22, bankAt(ctr / scale));
          float r = b > 0.35 ? mix(0.6, 1.0, hash12(c + 4.0 + scale)) * (0.75 + 0.25 * b) : -9.0; // overlapping lobes form one bank
          vec2 v = p - ctr;
          float sd = r - length(v);
          if (sd > best.x) { best = vec4(sd, v, hash12(c + 9.0)); rad = max(r, 1e-3); }
        }
        best.x /= scale;
        rad /= scale;
        return best;
      }

      void main() {
        vec3 d = normalize(vDir);
        float h = d.y, hh = max(h, 0.0);
        float m = dot(d, uMoon);
        float ang = acos(clamp(m, -1.0, 1.0));
        float side = pow(max(dot(normalize(d.xz + 1e-5), normalize(uMoon.xz)), 0.0), 2.0);
        float k = dayK(), dusk = duskAmt();
        vec3 sun = sunDir();
        float sunSide = pow(max(dot(normalize(d.xz + 1e-5), normalize(sun.xz)), 0.0), 2.0);
        float keySide = mix(side, sunSide, smoothstep(0.2, 0.55, k));
        float moonVis = 1.0 - smoothstep(0.35, 0.85, k);

        // ---- gradient (display space) ----
        vec3 zen = day3(vec3(0.028, 0.024, 0.07), vec3(0.13, 0.11, 0.3), vec3(0.4, 0.62, 0.86));
        vec3 mid = day3(vec3(0.085, 0.064, 0.16), vec3(0.48, 0.3, 0.5), vec3(0.64, 0.79, 0.92));
        vec3 glow = uHorizon * day3(1.28, 1.12, 1.03) + day3(vec3(0.03, 0.02, 0.02), vec3(0.04, 0.02, 0.0), vec3(0.01, 0.0, -0.01));
        glow *= 1.0 + 0.3 * side * (1.0 - smoothstep(0.2, 0.55, k));
        // the low sun sets the horizon on fire on its own side, a rose band on the far side
        glow = mix(glow, vec3(1.0, 0.62, 0.36), sunSide * dusk * 0.85);
        glow = mix(glow, glow * vec3(1.06, 1.0, 0.92), sunSide * smoothstep(0.5, 1.0, k));
        vec3 col = mix(mid, zen, smoothstep(0.1, 0.85, hh));
        col = mix(col, glow, exp(-hh * day3(9.0, 4.5, 4.0)));
        // painted wash: big soft value variation so the sky is not a flat ramp
        vec2 wp = d.xz / (hh + 0.5);
        col *= day3(0.88, 0.9, 0.95) + day3(0.26, 0.2, 0.1) * fbm3(wp * 1.1 + 4.0);

        // ---- stars (stereographic cells stay round and do not pinch at the zenith) ----
        vec2 sp = d.xz / (1.0 + hh) * 95.0;
        vec2 cell = floor(sp), jit = hash22(cell);
        float sh = hash12(cell + 7.7);
        float sd = length(fract(sp) - 0.2 - jit * 0.6);
        float size = mix(0.05, 0.13, sh * sh);
        float star = step(0.9, hash12(cell + 1.3)) * smoothstep(size, size * 0.3, sd);
        star *= 0.55 + 0.45 * sin(uTime * (1.2 + sh * 3.0) + sh * 40.0);
        star *= smoothstep(0.04, 0.3, h) * smoothstep(MR + 0.05, MR + 0.45, ang) * (1.0 - smoothstep(0.12, 0.4, k));

        // ---- moon halo ----
        float off = max(ang - MR, 0.0);
        vec3 haloCol = vec3(0.62, 0.56, 0.82);
        col += haloCol * (exp(-off / 0.045) * 0.42 + exp(-off / 0.2) * 0.2 + exp(-off / 0.6) * 0.06) * (1.0 - smoothstep(0.15, 0.5, k));

        // ---- moon disc: soft painted maria, a few ringed craters, lavender limb ----
        vec3 mu = normalize(cross(uMoon, vec3(0.0, 1.0, 0.0)));
        vec3 mv = cross(mu, uMoon);
        vec2 q = vec2(dot(d, mu), dot(d, mv)) / sin(MR);
        float r = length(q);
        float aa = fwidth(r) * 1.5;
        float disc = (1.0 - smoothstep(1.0 - aa, 1.0, r)) * step(0.0, m) * moonVis;
        float alphaBloom = 0.0;
        if (disc > 0.0) {
          float z = sqrt(max(1.0 - r * r, 0.0));
          vec2 sq = q / (0.55 + 0.45 * z); // slight spherical wrap
          float n = fbm3(sq * 1.4 + 2.3);
          float n2 = vnoise(sq * 4.5 + 9.0);
          float mare = smoothstep(0.46, 0.6, n) * 0.75 + smoothstep(0.6, 0.72, n) * 0.25;
          vec3 mc = mix(vec3(0.95, 0.93, 0.9), vec3(0.7, 0.66, 0.8), mare);
          mc = mix(mc, mc * vec3(0.9, 0.88, 0.97), smoothstep(0.55, 0.7, n2) * 0.7);
          // a few soft craters: shaded bowl on the side away from the light, bright lip toward it
          vec2 cq = sq * 2.6, cc = floor(cq);
          vec2 cj = hash22(cc + 5.0);
          float cr = mix(0.1, 0.22, cj.x);
          vec2 cv = (fract(cq) - 0.3 - cj * 0.4) / cr;
          float cdist = length(cv);
          float has = step(0.62, hash12(cc + 2.0));
          float bowl = smoothstep(1.0, 0.6, cdist);
          mc *= 1.0 - has * bowl * (0.05 + 0.08 * clamp(cv.y * 0.8 + 0.3, 0.0, 1.0));
          mc += has * smoothstep(0.7, 1.0, cdist) * smoothstep(1.3, 1.0, cdist) * clamp(-cv.y, 0.0, 1.0) * 0.05;
          mc *= mix(0.78, 1.0, pow(z, 0.45));
          mc = mix(mc, mc * vec3(0.9, 0.88, 1.06), 1.0 - z);
          // a daytime moon is a pale ghost of itself
          mc = mix(mc, mix(col, vec3(0.97, 0.97, 1.0), 0.55), smoothstep(0.5, 0.85, k));
          col = mix(col, mc, disc);
          alphaBloom = disc * 0.3 * moonVis;
        }
        alphaBloom += exp(-off / 0.04) * 0.5 * step(0.0, m) * (1.0 - disc) * moonVis * moonVis;

        // ---- sun: a flat painted disc with a soft warm halo, orange and swollen at dusk ----
        float sunVis = smoothstep(0.22, 0.45, k);
        float sAng = acos(clamp(dot(d, sun), -1.0, 1.0));
        float sr = SR * (1.0 + 0.25 * dusk);
        float sOff = max(sAng - sr, 0.0);
        vec3 sunHalo = mix(vec3(1.0, 0.9, 0.72), vec3(1.0, 0.5, 0.25), dusk);
        col += sunHalo * (exp(-sOff / 0.03) * 0.35 + exp(-sOff / 0.18) * 0.18 + exp(-sOff / 0.6) * 0.08) * sunVis;
        float sAa = fwidth(sAng) * 1.5;
        float sDisc = (1.0 - smoothstep(sr - sAa, sr, sAng)) * sunVis;
        if (sDisc > 0.0) {
          float sq = sAng / sr;
          vec3 sc = mix(vec3(1.0, 0.99, 0.94), vec3(1.0, 0.94, 0.78), smoothstep(0.4, 1.0, sq));
          sc = mix(sc, mix(vec3(1.0, 0.78, 0.5), vec3(1.0, 0.5, 0.3), smoothstep(0.2, 1.0, sq)), dusk);
          sc *= 0.96 + 0.06 * vnoise(vec2(dot(d, normalize(cross(sun, vec3(0.0, 1.0, 0.0)))), d.y) * 60.0); // brushed
          col = mix(col, sc, sDisc);
        }
        alphaBloom += sDisc * 0.2 + exp(-sOff / 0.05) * 0.25 * sunVis * (1.0 - sDisc);

        // ---- flat curly clouds ----
        vec2 base = d.xz / (hh + 0.3) * 1.6;
        vec2 cp = base + vec2(uTime * 0.01, uTime * 0.003);
        // the clouds are lit by the moon at night and by the sun from dusk on
        float sunW = smoothstep(0.2, 0.55, k);
        vec2 moonP = uMoon.xz / (uMoon.y + 0.3) * 1.6;
        vec2 sunP = sun.xz / (max(sun.y, 0.0) + 0.3) * 1.6;
        vec2 toL = normalize(mix(normalize(moonP - base + 1e-4), normalize(sunP - base + 1e-4), sunW) + 1e-4);
        float near = max(exp(-off / 0.35) * (1.0 - sunW), exp(-sOff / 0.35) * sunW * day3(1.0, 1.0, 0.35)); // moonlit (sunlit) zone
        // fewer clouds right on the moon so it stays readable (clouds thin out over the sun instead, see below),
        // a denser bank low in the sky; by day only a few
        float thr = 0.5 - 0.08 * smoothstep(0.45, 0.12, h) + 0.25 * exp(-off / 0.1) * moonVis + day3(0.0, 0.02, 0.16);
        float rBig, rSmall;
        // the big flat night banks become smaller puffy cumulus by day; the switch hides inside a short gap at
        // k = 0.62 where the clouds thin out to nothing, so no cloud ever pops
        float cs = k < 0.62 ? 1.0 : 1.9;
        float cGap = smoothstep(0.07, 0.0, abs(k - 0.62));
        vec4 big = lobes(cp, cs, thr, rBig);
        vec4 small = lobes(cp + 0.37, 2.3 * cs, thr + 0.04, rSmall);
        bool useBig = big.x >= small.x;
        float csd = max(big.x, small.x);
        vec2 nrm = useBig ? big.yz : small.yz;
        nrm = normalize(nrm + 1e-5);
        // high up the planar projection blows lobes up into huge arcs, so clouds keep to the lower sky
        float cover = smoothstep(day3(0.02, 0.03, 0.1), day3(0.14, 0.16, 0.22), h) * smoothstep(0.62, 0.3, h);
        // by day the bright clouds show the blocky derivative at lobe-cell seams, so the edge width is capped
        float aw = min(fwidth(csd) * 1.2, mix(1e3, 0.03, smoothstep(0.3, 0.7, k))) + 1e-4;
        float shape = smoothstep(-aw, aw, csd) * cover;
        // each lobe is shaded like a flat paper disc tilted to the moon: a bright crescent on the moon side
        float ndl = dot(nrm, toL);
        float rim = 1.0 - clamp(csd / (useBig ? rBig : rSmall) * 2.2, 0.0, 1.0); // 1 at the lobe edge
        vec3 body = mix(day3(vec3(0.085, 0.065, 0.15), vec3(0.34, 0.2, 0.36), vec3(0.76, 0.78, 0.9)),
                        day3(vec3(0.15, 0.115, 0.25), vec3(0.62, 0.34, 0.42), vec3(0.88, 0.88, 0.95)), keySide * day3(0.5, 0.5, 0.25) + near * 0.6);
        body *= day3(0.85, 0.85, 0.9) + day3(0.3, 0.3, 0.2) * smoothstep(-0.6, 0.6, nrm.y); // a little darker underneath
        vec3 litCol = mix(day3(vec3(0.24, 0.2, 0.37), vec3(0.85, 0.5, 0.42), vec3(1.0, 0.97, 0.92)),
                          day3(vec3(0.62, 0.58, 0.82), vec3(1.0, 0.7, 0.45), vec3(1.0, 0.98, 0.9)), near);
        body = mix(body, litCol, smoothstep(0.15, 0.55, ndl) * smoothstep(0.45, 0.95, rim));
        // curls: some big lobes carry a painted spiral stroke
        if (useBig && big.w > 0.84) {
          float rr = length(big.yz) / rBig;
          float an = atan(big.y, big.z) * (big.w > 0.86 ? 1.0 : -1.0);
          float sp = abs(fract(rr * 2.6 - an / 6.2832) - 0.5);
          float sw = fwidth(rr * 2.6) + 0.06;
          body = mix(body, litCol * 0.8 + body * 0.2, smoothstep(sw, sw * 0.4, sp) * smoothstep(0.85, 0.6, rr) * smoothstep(0.08, 0.2, rr) * 0.45);
        }
        // outline: silver lining beside the moon, an ink line elsewhere (matches the outlined models)
        float line = smoothstep(-aw, aw, csd) - smoothstep(aw, aw * 3.0 + 0.004, csd);
        body = mix(body, day3(vec3(0.05, 0.035, 0.09), vec3(0.2, 0.1, 0.2), vec3(0.52, 0.52, 0.72)), line * (1.0 - near) * day3(0.4, 0.4, 0.6));
        body += day3(vec3(0.6, 0.55, 0.8), vec3(0.6, 0.4, 0.25), vec3(0.1, 0.08, 0.05)) * line * near * (0.5 + 0.5 * max(ndl, 0.0));
        float ca = shape * 0.95 * (1.0 - cGap);
        ca *= 1.0 - sunVis * smoothstep(sr + 0.08, sr, sAng) * 0.8; // the sun shines through thin cloud
        col = mix(col, body, ca);
        star *= 1.0 - shape;
        alphaBloom *= 1.0 - ca * 0.85;
        col += vec3(0.85, 0.85, 1.0) * star;

        // ---- horizon: land exactly on the fog color, then stay near it below ----
        col = mix(col, uHorizon, exp(-hh * 55.0));
        if (h < 0.0) col = uHorizon * mix(1.0, 0.72, smoothstep(0.0, -0.35, h));

        gl_FragColor = vec4(srgbToLinear(col), 1.0 - alphaBloom);
        #include <colorspace_fragment>
      }`,side:Ae,depthWrite:!1,fog:!1}),n=new ce(new mr(500,48,24),e);return n.frustumCulled=!1,n.renderOrder=-1,n}function Kr(s,t=!1){const e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,c=new be;let l=0;for(let h=0;h<s.length;++h){const f=s[h];let u=0;if(e!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in f.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(f.attributes[d]),u++}if(u!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in f.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(f.morphAttributes[d])}if(t){let d;if(e)d=f.index.count;else if(f.attributes.position!==void 0)d=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,d,h),l+=d}}if(e){let h=0;const f=[];for(let u=0;u<s.length;++u){const d=s[u].index;for(let m=0;m<d.count;++m)f.push(d.getX(m)+h);h+=s[u].attributes.position.count}c.setIndex(f)}for(const h in r){const f=Nh(r[h]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;c.setAttribute(h,f)}for(const h in o){const f=o[h][0].length;if(f===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[h]=[];for(let u=0;u<f;++u){const d=[];for(let v=0;v<o[h].length;++v)d.push(o[h][v][u]);const m=Nh(d);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;c.morphAttributes[h].push(m)}}return c}function Nh(s){let t,e,n,i=-1,r=0;for(let l=0;l<s.length;++l){const h=s[l];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const o=new t(r),a=new xe(o,e,n);let c=0;for(let l=0;l<s.length;++l){const h=s[l];if(h.isInterleavedBufferAttribute){const f=c/e;for(let u=0,d=h.count;u<d;u++)for(let m=0;m<e;m++){const v=h.getComponent(u,m);a.setComponent(u+f,m,v)}}else o.set(h.array,c);c+=h.count*e}return i!==void 0&&(a.gpuType=i),a}function l1(s,t=1e-4){t=Math.max(t,Number.EPSILON);const e={},n=s.getIndex(),i=s.getAttribute("position"),r=n?n.count:i.count;let o=0;const a=Object.keys(s.attributes),c={},l={},h=[],f=["getX","getY","getZ","getW"],u=["setX","setY","setZ","setW"];for(let _=0,y=a.length;_<y;_++){const x=a[_],C=s.attributes[x];c[x]=new C.constructor(new C.array.constructor(C.count*C.itemSize),C.itemSize,C.normalized);const w=s.morphAttributes[x];w&&(l[x]||(l[x]=[]),w.forEach((T,R)=>{const S=new T.array.constructor(T.count*T.itemSize);l[x][R]=new T.constructor(S,T.itemSize,T.normalized)}))}const d=t*.5,m=Math.log10(1/t),v=Math.pow(10,m),g=d*v;for(let _=0;_<r;_++){const y=n?n.getX(_):_;let x="";for(let C=0,w=a.length;C<w;C++){const T=a[C],R=s.getAttribute(T),S=R.itemSize;for(let M=0;M<S;M++)x+=`${~~(R[f[M]](y)*v+g)},`}if(x in e)h.push(e[x]);else{for(let C=0,w=a.length;C<w;C++){const T=a[C],R=s.getAttribute(T),S=s.morphAttributes[T],M=R.itemSize,P=c[T],O=l[T];for(let I=0;I<M;I++){const F=f[I],z=u[I];if(P[z](o,R[F](y)),S)for(let D=0,Y=S.length;D<Y;D++)O[D][z](o,S[D][F](y))}}e[x]=o,h.push(o),o++}}const p=s.clone();for(const _ in s.attributes){const y=c[_];if(p.setAttribute(_,new y.constructor(y.array.slice(0,o*y.itemSize),y.itemSize,y.normalized)),_ in l)for(let x=0;x<l[_].length;x++){const C=l[_][x];p.morphAttributes[_][x]=new C.constructor(C.array.slice(0,o*C.itemSize),C.itemSize,C.normalized)}}return p.setIndex(h),p}new mr(1,20,14);new mr(1,10,8);const h1=new ws(1,1,1,18),u1=new Fi(1,1,1),Dh=new WeakMap;function f1(s){let t=Dh.get(s);if(!t){const e=s.clone();for(const n of Object.keys(e.attributes))n!=="position"&&e.deleteAttribute(n);t=l1(e,.001),t.computeVertexNormals(),Dh.set(s,t)}return t}function us(s,t,{pos:e,rot:n,scale:i,outline:r=.02}={}){const o=new ce(s,t);return e&&o.position.set(...e),n&&o.rotation.set(...n),i&&o.scale.set(...Array.isArray(i)?i:[i,i,i]),r&&o.add(new ce(f1(s),s1(r))),o}const sr={CYL:h1,BOX:u1},Gn=s=>s.toFixed(2),me=s=>{const t=new zt(s);return`vec3(${t.r.toFixed(4)}, ${t.g.toFixed(4)}, ${t.b.toFixed(4)})`},Uh=Xy+3.2,d1=[[Uh,Ts-2.4,Zr.x+1.5,Zr.z+.6],[Zr.x+1,Zr.z-.8,-6.5,5.2],[Uh-2,Ts-2.5,.5,5.4],[-10.5,.4,8.5,.4],[0,4.8,0,-6.5]],p1=`
${Fo}
${Us}
float fbm3(vec2 p) { return vnoise(p) * 0.57 + vnoise(p * 2.03 + 17.1) * 0.29 + vnoise(p * 4.1 + 31.7) * 0.14; }
vec2 rot2(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
// fade for a pattern of frequency k (cycles per meter) given the pixel footprint
float aaFade(float k, float px) { return 1.0 - smoothstep(0.18, 0.55, k * px); }
float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}
float roadCenter(float x) { return ${Gn(Ts)} + sin(x * 0.05) * 0.45 + sin(x * 0.13 + 1.0) * 0.2; }

// painterly night lawn: big soft color patches, brush-stroke grass marks, mist-colored drifts
vec3 lawn(vec2 p, float px) {
  float n1 = fbm3(p * 0.045);
  float n2 = fbm3(p * 0.13 + 5.3);
  float n3 = vnoise(p * 0.085 - 11.7) * 0.7 + vnoise(p * 0.3) * 0.3;
  float dp = dayPaint();
  vec3 col = mix(mix(${me("#232a2e")}, ${me("#4a5f3c")}, dp), mix(${me("#36433f")}, ${me("#6b8152")}, dp), smoothstep(0.32, 0.68, n1));
  col = mix(col, mix(${me("#4a5440")}, ${me("#9c9f6a")}, dp), smoothstep(0.55, 0.78, n2) * 0.55); // mossy lighter patches
  col = mix(col, mix(${me("#382c40")}, ${me("#6e5a72")}, dp), smoothstep(0.56, 0.74, n3) * mix(0.65, 0.45, dp)); // purple heather
  // brush strokes: elongated noise whose direction swirls slowly across the lawn
  float a = vnoise(p * 0.04 + 3.0) * 7.0;
  vec2 q = rot2(p, a);
  // short dabs, not long swoops: long ones read as rippling water
  float k1 = 9.0, k2 = 26.0;
  float s1 = smoothstep(0.55, 0.85, vnoise(q * vec2(5.0, k1)));
  float s2 = smoothstep(0.55, 0.9, vnoise(rot2(p, a + 0.9) * vec2(14.0, k2) + 7.0));
  float m = (s1 - 0.2) * 0.24 * aaFade(k1, px) - (s2 - 0.17) * 0.2 * aaFade(k2, px);
  col *= 1.0 + m;
  // pale grass tips catching the moon, only up close
  float tip = smoothstep(0.82, 0.95, vnoise(rot2(p, a + 0.3) * vec2(14.0, 34.0)));
  col += mix(${me("#7d8670")}, ${me("#d6dc8a")}, dp) * tip * 0.14 * aaFade(34.0, px);
  // drifts of low mist (by night)
  col = mix(col, ${me("#4a4466")}, smoothstep(0.55, 0.8, vnoise(p * 0.025 + 21.0)) * 0.15 * (1.0 - dp));
  return col;
}

// soft-edged dirt, mottled like dabbed paint
vec3 dirt(vec2 p, float px) {
  vec3 col = mix(${me("#35262a")}, ${me("#4f3a33")}, smoothstep(0.3, 0.7, fbm3(p * 0.6)));
  col = mix(col, ${me("#5e4740")}, smoothstep(0.6, 0.8, vnoise(p * 3.1)) * 0.5 * aaFade(3.1, px));
  float pebble = smoothstep(0.86, 0.93, vnoise(p * 11.0)) * aaFade(11.0, px);
  col += ${me("#6a5f74")} * pebble * 0.35;
  return col * mix(vec3(1.0), vec3(1.9, 1.6, 1.25), dayPaint()); // sunny earth is warm brown, not plum
}

// rutted dirt road along z = ROAD_Z; returns color, w = coverage
vec4 road(vec2 p, vec3 under, float px) {
  float dz = p.y - roadCenter(p.x);
  float edgeN = (vnoise(p * vec2(0.7, 1.5)) - 0.5) * 0.9 + (vnoise(p * 3.0) - 0.5) * 0.3;
  float cover = smoothstep(${Gn(ba+.35)}, ${Gn(ba-.35)}, abs(dz) + edgeN);
  vec3 col = mix(${me("#362b2f")}, ${me("#4a3d3c")}, smoothstep(0.25, 0.75, fbm3(p * vec2(0.15, 0.5))));
  // wheel streaks run along the road
  col *= 1.0 + (vnoise(vec2(p.x * 0.6, dz * 9.0)) - 0.5) * 0.3 * aaFade(9.0, px);
  col *= 1.0 + (smoothstep(0.55, 0.8, vnoise(p * 2.6)) - 0.15) * 0.3 * aaFade(2.6, px); // clods
  // two ruts with standing puddles that mirror the sky
  float rd = abs(abs(dz) - 0.95);
  float rut = smoothstep(0.42, 0.12, rd + (vnoise(p * 0.9) - 0.5) * 0.12);
  col = mix(col, ${me("#2a2026")}, rut * 0.75);
  float puddle = rut * smoothstep(0.66, 0.74, fbm3(p * vec2(0.22, 0.9) + 4.0));
  col *= mix(vec3(1.0), vec3(1.8, 1.55, 1.3), dayPaint());
  col = mix(col, mix(${me("#4c4868")}, ${me("#a9c2d8")}, dayPaint()), puddle * 0.7); // puddles mirror the sky
  // the hump between the ruts keeps a ragged strip of grass
  float hump = smoothstep(0.55, 0.15, abs(dz)) * smoothstep(0.4, 0.65, vnoise(p * vec2(0.6, 2.0) + 2.0));
  col = mix(col, under * 0.85, hump * 0.75);
  return vec4(col, cover);
}

// lawn + worn paths + road for any point of the ground plane
vec3 groundTop(vec2 p, float px) {
  vec3 grass = lawn(p, px);
  vec3 col = grass;
  float wear = 0.0;
  ${d1.map(([s,t,e,n])=>`wear = max(wear, smoothstep(0.95, 0.15, segDist(p, vec2(${Gn(s)}, ${Gn(t)}), vec2(${Gn(e)}, ${Gn(n)}))));`).join(`
  `)}
  if (wear > 0.0) {
    float wn = vnoise(p * 1.3) * 0.6 + vnoise(p * 4.0) * 0.4;
    wear = smoothstep(0.35, 0.8, wear * (0.45 + wn * 0.85));
    col = mix(col, mix(dirt(p, px), grass, 0.3), wear * 0.75);
  }
  if (abs(p.y - ${Gn(Ts)}) > ${Gn(ba+2.5)}) return col;
  vec4 r = road(p, grass, px);
  return mix(col, r.rgb, r.w);
}
`,Wn=(s,t,e)=>{const n=Math.min(1,Math.max(0,(e-s)/(t-s)));return n*n*(3-2*n)},Jr=(s,t)=>{const e=Math.sin(s*127.1+t*311.7)*43758.5453;return e-Math.floor(e)};function m1(s,t){const e=Math.floor(s),n=Math.floor(t),i=s-e,r=t-n,o=i*i*(3-2*i),a=r*r*(3-2*r),c=Jr(e,n),l=Jr(e+1,n),h=Jr(e,n+1),f=Jr(e+1,n+1);return c+(l-c)*o+(h-c)*a+(c-l-h+f)*o*a}function xo(s,t){let e=0,n=.5;for(let i=0;i<4;i++)e+=n*m1(s,t),s=s*2.03+17.1,t=t*2.03+17.1,n*=.5;return e/.9375}const g1=s=>Ts+Math.sin(s*.05)*.45+Math.sin(s*.13+1)*.2,Fh=new ct(Ni.x,Ni.z).normalize(),ge={x:Fh.x*118,z:8.5+Fh.y*118},uf=178;function Qr(s,t){const e=Math.pow(s**8+t**8,.125),n=Math.hypot(s,t);let i=Math.pow(Wn(Li+4,Li+30,e),1.3)*(1.5+12*xo(s*.017+3,t*.017-2));i+=Wn(80,uf-10,n)*(5+13*xo(s*.009+9,t*.009));const r=Math.hypot(s-ge.x,t-ge.z),o=.75+.5*xo(s*.06,t*.06);i+=25*Math.pow(Wn(40*o,8,r),1.4)+6*Wn(75,25,Math.hypot(s-ge.x-22,t-ge.z+6));const a=Math.abs(t-g1(s)),c=Math.pow(Wn(80,165,Math.abs(s)),1.3)*9;return i=c+(i-c)*Wn(5.5,18,a)*(i>c?1:0),e<Li+3.5?Math.min(i,-.4+(e-Li-2.5)*.4):i}const _r=`
  #ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
    #else
      float fogF = smoothstep(fogNear, fogFar, vFogDepth);
    #endif
    // the cap eases in with distance from the yard so the hills meet the ground slab without a seam
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, min(fogF, mix(1.0, uFogMax, smoothstep(31.0, 42.0, length(vW.xz)))));
  #endif`,v1=`
  varying vec3 vW; varying vec3 vN;
  #ifdef USE_COLOR
  varying vec3 vCol;
  #endif
  #ifdef PHASE
  attribute float aPhase; varying float vPhase;
  #endif
  #ifdef STRIPE
  attribute float aStripe; varying float vStripe;
  #endif
  #include <common>
  #include <fog_pars_vertex>
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    #ifdef USE_COLOR
    vCol = color;
    #endif
    #ifdef PHASE
    vPhase = aPhase;
    #endif
    #ifdef STRIPE
    vStripe = aStripe;
    #endif
    vec4 mvPosition = viewMatrix * w;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }`,ff=s=>new zt(s),jc=[],si=s=>{const t=ff(s[0]);return jc.push([t,s]),t};function es(s,t,e={}){const n=new Ie({uniforms:Lo.merge([ft.fog,t]),vertexShader:v1,fragmentShader:s,fog:!0,...e});n.uniforms.uDay=Uo;for(const[i,r]of Object.entries(t))r.value&&r.value.isColor&&jc.some(([o])=>o===r.value)&&(n.uniforms[i].value=r.value);return t.uTime&&(n.uniforms.uTime=t.uTime),n}const _1=`
  uniform float uFogMax; uniform float uTime; uniform vec3 uHaze; uniform vec3 uMist;
  varying vec3 vW; varying vec3 vN;
  #include <common>
  #include <fog_pars_fragment>
  ${p1}
  ${zo}
  void main() {
    vec3 N = normalize(vN);
    vec2 p = vW.xz;
    vec2 dp = fwidth(p);
    float px = mix(min(dp.x, dp.y), max(max(dp.x, dp.y), fwidth(vW.y)), 0.85); // see ground.js: avoids radial streaks
    float r = length(p);
    vec3 col = groundTop(p, px);
    // steep flanks lose their grass to bare earth streaks, like dry-brushed paint
    float steep = smoothstep(0.88, 0.7, N.y) * smoothstep(0.4, 0.6, vnoise(p * vec2(0.12, 0.5)));
    col = mix(col, mix(vec3(0.045, 0.03, 0.04), vec3(0.2, 0.12, 0.07), dayPaint()), steep * 0.6);
    col = mix(col, uHaze, smoothstep(40.0, 175.0, r) * mix(0.35, 0.25, dayPaint()));
    vec3 lit = toonShade(col, N, vW);
    float mn = vnoise(p * 0.035 + vec2(uTime * 0.03, uTime * 0.011));
    float mist = smoothstep(2.5, -0.5, vW.y - mn * 3.0) * smoothstep(40.0, 70.0, r);
    lit = mix(lit, uMist, mist * 0.35 * (1.0 - 0.7 * dayPaint())); // only wisps by day
    gl_FragColor = vec4(lit, 1.0);
    #include <colorspace_fragment>
    ${_r}
  }`,zh=`
  uniform float uFogMax; uniform float uTime; uniform vec3 uColor; uniform vec3 uHaze; uniform vec2 uMistY;
  varying vec3 vW; varying vec3 vN;
  #include <common>
  #include <fog_pars_fragment>
  ${Us}
  ${zo}
  void main() {
    vec3 N = normalize(vN);
    if (!gl_FrontFacing) N = -N;
    vec3 col = uColor * (0.82 + 0.4 * smoothstep(0.0, 0.6, dot(N, keyDir())));
    float a = atan(vW.z, vW.x);
    col *= 0.9 + 0.2 * vnoise(vec2(a * 60.0, vW.y * 0.15));
    float m = smoothstep(uMistY.y, uMistY.x, vW.y + (vnoise(vec2(a * 18.0 + uTime * 0.02, 1.0)) - 0.5) * (uMistY.y - uMistY.x) * 0.6);
    col = mix(col, uHaze, m * 0.75);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    ${_r}
  }`,x1=`
  uniform float uFogMax; uniform vec3 uHaze;
  varying vec3 vW; varying vec3 vN; varying vec3 vCol; varying float vStripe;
  #include <common>
  #include <fog_pars_fragment>
  ${Us}
  ${zo}
  void main() {
    vec3 N = normalize(vN);
    vec3 base = vCol * (0.88 + 0.24 * vnoise(vW.xy * 1.3 + vW.z));
    if (vStripe > 0.5) {
      float c = (vW.y + abs(vW.x - vW.z) * 0.35) * 1.2;
      float aa = fwidth(c);
      float s = smoothstep(-aa, aa, abs(fract(c) - 0.5) - 0.25);
      base = mix(vec3(0.75, 0.7, 0.62), vec3(0.012, 0.008, 0.02), mix(s, 0.5, smoothstep(0.3, 0.6, aa)));
    }
    base = mix(base, uHaze, 0.25);
    gl_FragColor = vec4(toonShadeRim(base, N, vW, 1.4), 1.0);
    #include <colorspace_fragment>
    ${_r}
  }`,y1=`
  uniform float uFogMax; uniform float uTime;
  varying vec3 vW; varying vec3 vN; varying float vPhase;
  #include <common>
  #include <fog_pars_fragment>
  ${Fo}
  void main() {
    float t = uTime * (0.7 + fract(vPhase * 7.3)) + vPhase * 40.0;
    float fl = 0.86 + 0.08 * sin(t * 2.3) + 0.06 * sin(t * 5.7 + 1.3);
    fl *= 1.0 - 0.45 * smoothstep(0.92, 0.99, sin(t * 0.37));
    vec3 col = mix(vec3(1.0, 0.55, 0.2), vec3(1.0, 0.8, 0.45), fract(vPhase * 3.1)) * 2.6 * fl;
    // each window goes out at its own moment through the dusk
    float on = clamp(lampsOn() * 1.6 - fract(vPhase * 5.7) * 0.6, 0.0, 1.0);
    col = mix(vec3(0.035, 0.03, 0.05), col, on);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    ${_r}
  }`,M1=`
  uniform float uFogMax; uniform float uTime; uniform vec3 uColor; uniform vec2 uY; uniform float uAlpha;
  varying vec3 vW; varying vec3 vN;
  #include <common>
  #include <fog_pars_fragment>
  ${Us}
  void main() {
    float a = atan(vW.z, vW.x);
    vec2 q = vec2(a * 22.0 + uTime * 0.015, vW.y * 0.09);
    float n = vnoise(q + vec2(vnoise(q * 0.7 - uTime * 0.01) * 1.5, 0.0)) * 0.65 + vnoise(q * 2.3) * 0.35;
    float h = (vW.y - uY.x) / (uY.y - uY.x);
    float alpha = smoothstep(0.0, 0.25, h) * smoothstep(1.0, 0.35, h) * smoothstep(0.3, 0.7, n) * uAlpha;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
    ${_r}
  }`;class Mn{constructor(){this.v=[]}tri(t,e,n){this.v.push(t[0],t[1],e[0],e[1],n[0],n[1])}quad(t,e,n,i){this.tri(t,e,n),this.tri(t,n,i)}poly(t){const e=ms.triangulateShape(t.map(n=>new ct(n[0],n[1])),[]);for(const[n,i,r]of e)this.tri(t[n],t[i],t[r])}strip(t,e,n){const i=t.length,r=[],o=[];for(let a=0;a<i;a++){const c=t[Math.max(0,a-1)],l=t[Math.min(i-1,a+1)];let h=l[0]-c[0],f=l[1]-c[1];const u=Math.hypot(h,f)||1;h/=u,f/=u;const d=(e+(n-e)*(a/(i-1)))/2;r.push([t[a][0]-f*d,t[a][1]+h*d]),o.push([t[a][0]+f*d,t[a][1]-h*d])}for(let a=0;a<i-1;a++)this.quad(r[a],o[a],o[a+1],r[a+1])}rect(t,e,n,i,r=0){this.quad([t,e],[n,e],[n+r,i],[t+r,i])}geometry(t=0){const e=this.v.length/2,n=new Float32Array(e*3),i=new Float32Array(e*3);for(let o=0;o<e;o++)n[o*3]=this.v[o*2],n[o*3+1]=this.v[o*2+1],n[o*3+2]=t,i[o*3+2]=1;const r=new be;return r.setAttribute("position",new xe(n,3)),r.setAttribute("normal",new xe(i,3)),r}}function to(s,t,e,n=1){const i=t.range(-.18,.18)*e,r=t.range(0,6),o=[];for(let l=0;l<=7;l++){const h=l/7;o.push([i*h*h+Math.sin(h*3+r)*.07*e,-2+h*(e+2)])}s.strip(o,e*.15,e*.03),s.poly([[-e*.15,-2],[e*.15,-2],[e*.13,0],[e*.03,e*.12],[-e*.03,e*.12],[-e*.12,0]]);const a=3+Math.floor(t()*3)+(n>.7?1:0),c=n>.7?13:8;for(let l=0;l<a;l++){const h=l%2?1:-1,f=t.range(.42,.95),u=Math.min(7,Math.round(f*7));let[d,m]=o[u];const v=h*t.range(.35,1),g=e*t.range(.32,.55)*(1.15-f*.45),p=h*t.range(3.5,6.5),_=[[d,m]];for(let y=1;y<=c;y++){const x=y/c,C=v+p*Math.pow(x,2.4),w=g/c*(1.25-.7*x);if(d+=Math.sin(C)*w,m+=Math.cos(C)*w,_.push([d,m]),y===Math.floor(c*.4)&&t()<.6*n){let T=d,R=m;const S=[[T,R]];for(let M=1;M<=5;M++){const P=C-h*(.6+M*.45);T+=Math.sin(P)*g*.07,R+=Math.cos(P)*g*.07,S.push([T,R])}s.strip(S,e*.02,e*.005)}}s.strip(_,e*.055*(1.1-f*.5),e*.008)}}function Oh(s,t,e){const n=e*.11,i=t.range(-.25,.25)*e*.3;s.rect(-n/2,-1.5,n/2,e,i);const r=e*.68,o=i*(r+1.5)/(e+1.5);s.rect(-e*.3+o,r-n/2,e*.3+o,r+n/2)}function S1(s,t,e){const n=e*t.range(.45,.65),i=[[-n/2,-1.2],[n/2,-1.2]],r=t.range(-.15,.15)*e;for(let o=0;o<=8;o++){const a=o/8*Math.PI;i.push([Math.cos(a)*n/2+r,e-n/2+Math.sin(a)*n/2])}s.poly(i)}function E1(s,t,e,n,i,r){const o=t.range(-.08,.08)*n;s.quad([-e/2,-4],[e/2,-4],[e/2+o,n],[-e/2+o,n]);const a=e*t.range(.6,1.1),c=t.range(-.25,.25)*e,l=e*.12,h=[[-e/2-l+o,n-.3],[e/2+l+o,n-.3]];for(let u=1;u<=5;u++){const d=u/5;h.push([e/2*(1-d)+o+c*d*d,n+a*Math.pow(d,.75)])}for(let u=4;u>=1;u--){const d=u/5;h.push([-e/2*(1-d)+o+c*d*d-e*.05*d,n+a*Math.pow(d,.75)*.97])}s.poly(h),t()<.7&&s.rect(e*.18+o,n+a*.2,e*.3+o,n+a*.75,t.range(-.3,.3));const f=1+Math.floor(t()*2.5);for(let u=0;u<f;u++){const d=(t()-.5)*e*.55+o*.5,m=n*t.range(.35,.7),v=Math.min(e,n)*.16;t()<.85&&i.push([d-v/2,m-v*.7,d+v/2,m+v*.7])}if(r){const u=-e*.35+o,d=e*.32,m=n*1.9;s.rect(u-d/2,n*.5,u+d/2,m,t.range(-.4,.4));const v=[[u-d*.75,m],[u+d*.75,m]];for(let g=1;g<=4;g++){const p=g/4;v.push([u+d*.75*(1-p)+d*1.2*p*p,m+d*2.6*p])}for(let g=3;g>=1;g--){const p=g/4;v.push([u-d*.75*(1-p)+d*1.2*p*p,m+d*2.6*p])}s.poly(v),i.push([u-d*.18,m-d*.9,u+d*.18,m-d*.35])}}const Si=new Ge;function eo(s,t,e,n=0,i=1,r=[0,4]){return Si.position.set(s,t,e),Si.rotation.set(0,0,0),Si.scale.setScalar(i),Si.lookAt(r[0],t,r[1]),Si.rotateZ(n),Si.updateMatrix(),Si.matrix.clone()}function Bh(s,t,e){const n=new Mn;for(const[a,c,l,h]of s)n.rect(a,c,l,h);const i=n.geometry(.06).applyMatrix4(t),r=i.attributes.position.count,o=new Float32Array(r);for(let a=0;a<r;a+=6)o.fill(e(),a,a+6);return i.setAttribute("aPhase",new xe(o,1)),i}function w1(s,t,e=200){const n=[[0,1,0],[10,.6,-2],[22,0,-60]],i=[];for(let a=0;a<=e;a++)for(const[c,l,h]of n){const f=a/e*Math.PI*2,u=t(f);i.push(Math.cos(f)*(s-c),u*l+h,Math.sin(f)*(s-c))}const r=[];for(let a=0;a<e;a++)for(let c=0;c<n.length-1;c++){const l=a*3+c,h=l+3;r.push(l,l+1,h,h,l+1,h+1)}const o=new be;return o.setAttribute("position",new le(i,3)),o.setIndex(r),o.computeVertexNormals(),o.toNonIndexed()}const ns=(s,t,e)=>xo(Math.cos(s)*t+e,Math.sin(s)*t-e),Pa=(s,t)=>Math.atan2(t,s),is=(s,t)=>Math.abs(Math.atan2(Math.sin(s-t),Math.cos(s-t)));function b1(s){const t=Sn(4242),e={value:0},n=new ai;n.name="backdrop";{const _=[];for(let T=0;T<=40;T++)_.push(Li-4+(uf-Li+4)*Math.pow(T/40,1.55));const y=[];for(const T of _)for(let R=0;R<168;R++){const S=R/168*Math.PI*2,M=Math.cos(S)*T,P=Math.sin(S)*T;y.push(M,Qr(M,P),P)}const x=[];for(let T=0;T<_.length-1;T++)for(let R=0;R<168;R++){const S=T*168+R,M=T*168+(R+1)%168,P=S+168,O=M+168;x.push(S,M,P,M,O,P)}const C=new be;C.setAttribute("position",new le(y,3)),C.setIndex(x),C.computeVertexNormals();const w=es(_1,{uFogMax:{value:.42},uTime:e,uHaze:{value:si(["#2e2840","#5a3a58","#a9b89a"])},uMist:{value:si(["#544c78","#9a6a86","#efe6dc"])}},{polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2});n.add(new ce(C,w))}const i=[],r=(p,_)=>Math.abs(_-Ts)<13&&Math.abs(p)>Li-2||Math.hypot(p-ge.x,_-ge.z)<30,o=(p,_,y,x,C=0)=>{const w=new Mn;p(w),i.push(w.geometry().applyMatrix4(eo(_,Qr(_,y)-.3,y,C,x)))},a=[[-2.3,-1.15,62,9],[-.75,-.15,58,6],[.55,1.3,66,6],[1.9,2.75,60,6],[-2.95,-2.5,70,3]];for(const[p,_,y,x]of a)for(let C=0;C<x;C++){const w=p+(_-p)*(C+t.range(.1,.9))/x,T=y+t.range(-8,10),R=Math.cos(w)*T,S=Math.sin(w)*T;if(r(R,S))continue;const M=Sn(Math.floor(t()*1e6));o(P=>to(P,M,t.range(5.5,9.5),1),R,S,1,t.range(-.08,.08))}{const p=Sn(77),_=ge.x+13,y=ge.z+7;o(x=>to(x,p,14,1),_,y,1,-.1)}for(let p=0;p<46;p++){const _=t()*Math.PI*2,y=t.range(36,64),x=Math.cos(_)*y,C=Math.sin(_)*y;if(r(x,C))continue;const w=Sn(Math.floor(t()*1e6));o(T=>t()<.55?Oh(T,w,t.range(1.3,2.2)):S1(T,w,t.range(.9,1.5)),x,C,1,t.range(-.3,.3))}for(let p=0;p<9;p++){const _=t()*Math.PI*2,y=t.range(9,17),x=ge.x+Math.cos(_)*y,C=ge.z+Math.sin(_)*y;if(C>ge.z+12&&Math.abs(x-ge.x)<5)continue;const w=Sn(p+900);o(T=>Oh(T,w,t.range(1.8,2.6)),x,C,1,t.range(-.35,.35))}const c=es(zh,{uFogMax:{value:.42},uTime:e,uColor:{value:si(["#1a1424","#2a1c34","#4a3f42"])},uHaze:{value:si(["#3d3656","#6a4a6a","#b8bca4"])},uMistY:{value:new ct(0,3)}});n.add(new ce(Kr(i),c));const l=[];{const p=new ai,_="#4a3f5c",y="#221b2c",x="#2c2438",C=(X,tt,st,J=[0,0,0],Nt=[1,1,1],$=0,nt=p)=>{const dt=new ce(X,null);return dt.position.set(...st),dt.rotation.set(...J),dt.scale.set(...Nt),dt.userData={color:tt,stripe:$},nt.add(dt),dt},w=new Fi(1,1,1);C(w,_,[.6,3,-1],[0,0,.035],[7,6.4,11]);const T=new Ku([new ct(-4.5,0),new ct(4.6,0),new ct(.9,5.8),new ct(.2,5.4)]),R=new Wc(T,{depth:12.4,bevelEnabled:!1});C(R,y,[.75,6.1,-7.2],[0,0,.06]),C(w,_,[4.6,1.6,1.5],[0,0,-.04],[2.4,3.2,3.2]),C(new lr(2.4,2.2,4),y,[4.7,4.1,1.5],[0,Math.PI/4,-.12]),C(w,x,[-2.6,5,4.6],[.03,0,.06],[3.2,10,3.2]);const S=new ai;S.position.set(-2.95,10,4.75),S.rotation.set(.04,.2,.08),p.add(S),C(w,_,[0,1.3,0],[0,0,0],[3.7,2.6,3.7],0,S),C(new lr(2.9,1.2,4),y,[0,3.1,0],[0,Math.PI/4,0],[1,1,1],0,S);let M=S,P=3.5;const O=[[2,3.8,.12],[1.35,3.6,.22],[.75,3.4,.36],[.3,2.2,.5]];for(const[X,tt,st]of O){const J=new ai;J.position.set(0,P,0),J.rotation.set(0,0,-st),M.add(J),C(new ws(X*.62,X,tt,4,1),y,[0,tt/2,0],[0,Math.PI/4,0],[1,1,1],1,J),M=J,P=tt}C(w,"#14101a",[0,P+.9,0],[0,0,0],[.12,2,.12],0,M),C(new qc(.45,.07,4,10,Math.PI*1.6),"#14101a",[.4,P+1.7,0],[0,0,.5],[1,1,1],0,M),C(w,x,[2.4,9.6,-4],[0,0,-.1],[.9,3,.9]);const I=[],F=(X,tt,st,J,Nt)=>I.push({cx:X,cy:tt,w:st,h:J,place:Nt});for(const X of[-5,-1.5,2])F(X,3.2,1,2,"side");F(1.6,3.6,1.4,2.4,"front"),F(-2.6,1.3,1.5,2.4,"door"),F(0,1.4,1.2,1.4,"belfry"),p.position.set(ge.x,Qr(ge.x,ge.z)-.4,ge.z),p.lookAt(0,p.position.y,8.5),p.rotateY(-.45),p.updateMatrixWorld(!0);const z=[];p.traverse(X=>{if(!X.isMesh)return;let tt=X.geometry.index?X.geometry.toNonIndexed():X.geometry.clone();tt.deleteAttribute("uv"),tt.applyMatrix4(X.matrixWorld);const st=tt.attributes.position.count,J=ff(X.userData.color),Nt=new Float32Array(st*3),$=new Float32Array(st).fill(X.userData.stripe);for(let nt=0;nt<st;nt++)J.toArray(Nt,nt*3);tt.setAttribute("color",new xe(Nt,3)),tt.setAttribute("aStripe",new xe($,1)),z.push(tt)});const D=es(x1,{uFogMax:{value:.5},uHaze:{value:si(["#4a4266","#7a5070","#c0c4b0"])}},{vertexColors:!0,defines:{STRIPE:1}});n.add(new ce(Kr(z),D));const Y=Sn(31),G=Math.atan2(8.5-ge.z,-ge.x);for(let X=0;X<6;X++){const tt=G+(X%2?.45:-.35)+X*.05,st=34-X*5,J=ge.x+Math.cos(tt)*st,Nt=ge.z+Math.sin(tt)*st,$=new Mn;$.rect(-.35,1.4,.35,2.1);const nt=$.geometry().applyMatrix4(eo(J,Qr(J,Nt),Nt));nt.setAttribute("aPhase",new xe(new Float32Array(6).fill(Y()),1)),l.push(nt)}for(const{cx:X,cy:tt,w:st,h:J,place:Nt}of I){const $=new Mn,nt=[[-st/2,-J/2],[st/2,-J/2]];for(let Dt=0;Dt<=6;Dt++){const Xt=Dt/6*Math.PI;nt.push([Math.cos(Xt)*st/2,J/2-st/2+Math.sin(Xt)*st/2])}$.poly(nt);const dt=$.geometry(),ot=new Zt;Nt==="side"?ot.compose(new U(4.15,tt,X),new sn().setFromEuler(new rn(0,Math.PI/2,.035)),new U(1,1,1)):Nt==="front"?ot.makeTranslation(X,tt,4.55):Nt==="door"?ot.makeTranslation(X,tt,6.25):ot.makeTranslation(0,1.4,1.9);const It=Nt==="belfry"?S.matrixWorld:p.matrixWorld;dt.applyMatrix4(new Zt().multiplyMatrices(It,ot));const Ot=new Float32Array(dt.attributes.position.count).fill(Y());dt.setAttribute("aPhase",new xe(Ot,1)),l.push(dt)}}const h={hub:null},f=[{R:236,H:p=>13+20*ns(p,2.2,1)+10*ns(p,6,4)**2,color:["#211b2e","#3a2640","#5e7c52"],haze:["#3a3452","#7a5070","#b4c09e"],fog:.32,mist:[4,16]},{R:336,H:p=>26+34*ns(p,1.8,7)+8*ns(p,7,2),color:["#382f50","#5a3a5c","#86a07e"],haze:["#4d4570","#8a5a78","#c4cbb4"],fog:.5,mist:[10,30]},{R:470,H:p=>48+50*ns(p,1.5,13)+10*ns(p,5,3),color:["#564c80","#7a5078","#a6b8bc"],haze:["#665e92","#9a6680","#d2d6cc"],fog:.62,mist:[20,50]}],u=Pa(1,-.32),d=Pa(-1,.3),m=Pa(-.25,1);f.forEach((p,_)=>{const y=p.H;p.H=R=>{let S=y(R);return _===1&&(S=S+(40-S)*Wn(.28,.12,is(R,u))),_===0&&(S=S+(30-S)*Wn(.14,.05,is(R,d))),_===1&&(S=S+(34-S)*Wn(.2,.08,is(R,m))),S};const x=[w1(p.R,p.H)],C=(R,S=3)=>[Math.cos(R)*(p.R-S),p.H(R)-.6-S*.1,Math.sin(R)*(p.R-S)],w=(R,S,M=1,P=0,O=3)=>{const[I,F,z]=C(S,O),D=eo(I,F,z,P,M);return x.push(R.geometry().applyMatrix4(D)),D};if(_===0){for(let M=0;M<16;M++){const P=t()*Math.PI*2;if(is(P,d)<.15)continue;const O=new Mn;to(O,Sn(Math.floor(t()*1e6)),t.range(9,15),.5),w(O,P,1,t.range(-.1,.1))}const R=new Mn;R.poly([[-4,-3],[4,-3],[2.4,16],[-1.8,16.3]]),R.poly([[-3.2,15.5],[3.6,15.5],[.6,20.5]]),R.rect(-.9,-3,.9,3.2);const S=w(R,d,1,.04);l.push(Bh([[-.5,8,.6,9.6],[.2,12.5,1,13.6]],S,t)),h.hub=new U(.4,15.2,1.2).applyMatrix4(S),h.m=S}else if(_===1){for(const[R,S]of[[u,9],[m,5]])for(let M=0;M<S;M++){const P=R+(M-S/2)*.028+t.range(-.008,.008),O=new Mn,I=[];E1(O,t,t.range(6,11),t.range(6,11),I,M===Math.floor(S/2)||S>6&&M===1);const F=w(O,P,1,t.range(-.06,.06),3+M%3*3);l.push(Bh(I,F,t))}for(let R=0;R<18;R++){const S=t()*Math.PI*2;if(is(S,u)<.3||is(S,m)<.2)continue;const M=new Mn;to(M,Sn(Math.floor(t()*1e6)),t.range(14,22),.4),w(M,S,1,t.range(-.1,.1))}}else for(let R=0;R<70;R++){const S=t()*Math.PI*2,M=t.range(12,26),P=M*t.range(.18,.3),[O,I,F]=C(S,2),z=new Mn;z.poly([[-P,-6],[P,-6],[t.range(-.15,.15)*M,M]]),x.push(z.geometry().applyMatrix4(eo(O,I,F,t.range(-.1,.1))))}const T=es(zh,{uFogMax:{value:p.fog},uTime:e,uColor:{value:si(p.color)},uHaze:{value:si(p.haze)},uMistY:{value:new ct(...p.mist)}},{side:pn});p.mat=T,n.add(new ce(Kr(x),T))});let v=null;{const p=new Mn;for(let _=0;_<4;_++){const y=_/4*Math.PI*2+.3,x=Math.cos(y),C=Math.sin(y),w=(T,R)=>[x*T-C*R,C*T+x*R];p.quad(w(0,-.25),w(10,-.25),w(10,.25),w(0,.25)),p.quad(w(2.5,.25),w(10,.25),w(10,2),w(2.5,1.6))}v=new ce(p.geometry(),f[0].mat),v.position.copy(h.hub),v.quaternion.setFromRotationMatrix(h.m),n.add(v)}{const p=Kr(l),_=es(y1,{uFogMax:{value:.3},uTime:e},{defines:{PHASE:1},side:pn});n.add(new ce(p,_))}const g=[];for(const[p,_,y,x,C]of[[200,-6,22,.3,["#5e5684","#a07090","#f4ece2"]],[300,0,45,.3,["#6a6290","#b07a94","#f6efe6"]]]){const w=new ws(p,p,y-_,120,1,!0).translate(0,(_+y)/2,0),T=es(M1,{uFogMax:{value:.6},uTime:e,uColor:{value:si(C)},uY:{value:new ct(_,y)},uAlpha:{value:x}},{transparent:!0,depthWrite:!1,side:Ae}),R=new ce(w,T);R.renderOrder=2,R.userData.alpha=x,g.push(R),n.add(R)}for(const p of n.children)p.matrixAutoUpdate=p===v;return n.traverse(p=>p.updateMatrix()),s.add(n),{update(p,_){e.value=p,v&&(v.rotateZ(_*.25),v.updateMatrix())},setDay(p){for(const[_,y]of jc)Qy(y,p,_);for(const _ of g)_.material.uniforms.uAlpha.value=_.userData.alpha*(1-.45*Math.min(1,Math.max(0,p)))}}}const T1=new Vu(-1,1,1,-1,0,1);class A1 extends be{constructor(){super(),this.setAttribute("position",new le([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new le([0,2,0,0,2,0],2))}}const C1=new A1;class R1{constructor(t){this._mesh=new ce(C1,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,T1)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}const P1="varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",df="float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }",L1=`
uniform sampler2D tScene; uniform vec2 uTexel; uniform float uThr; uniform float uWarmThr;
varying vec2 vUv;
${df}
vec3 key(vec4 s) {
  vec3 c = s.rgb;
  float l = luma(c);
  float warm = clamp((c.r - c.b) / max(c.r, 1e-3), 0.0, 1.0) * step(0.25 * c.r, c.g);
  float t = mix(uThr, uWarmThr, smoothstep(0.5, 0.8, warm));
  float w = max(l - t, 0.0) / max(l, 1e-3);
  w = w * w / (w + 0.15) + clamp(1.0 - s.a, 0.0, 1.0) * 1.2;
  // Karis-style weight keeps single bright pixels from flickering
  return c * w / (1.0 + l * 0.5);
}
void main() {
  vec2 o = uTexel;
  vec3 c = key(texture2D(tScene, vUv + vec2(-o.x, -o.y))) + key(texture2D(tScene, vUv + vec2(o.x, -o.y)))
         + key(texture2D(tScene, vUv + vec2(-o.x, o.y))) + key(texture2D(tScene, vUv + vec2(o.x, o.y)));
  gl_FragColor = vec4(c * 0.25, 1.0);
}`,I1=`
uniform sampler2D tSrc; uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 o = uTexel;
  vec3 c = texture2D(tSrc, vUv).rgb * 4.0;
  c += texture2D(tSrc, vUv - o).rgb + texture2D(tSrc, vUv + o).rgb;
  c += texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb + texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}`,N1=`
uniform sampler2D tSrc; uniform sampler2D tSame; uniform vec2 uTexel; uniform float uScatter;
varying vec2 vUv;
void main() {
  vec2 o = uTexel;
  vec3 c = texture2D(tSrc, vUv + vec2(-o.x * 2.0, 0.0)).rgb + texture2D(tSrc, vUv + vec2(o.x * 2.0, 0.0)).rgb
         + texture2D(tSrc, vUv + vec2(0.0, -o.y * 2.0)).rgb + texture2D(tSrc, vUv + vec2(0.0, o.y * 2.0)).rgb;
  c += (texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb + texture2D(tSrc, vUv + vec2(o.x, o.y)).rgb
      + texture2D(tSrc, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb) * 2.0;
  gl_FragColor = vec4(texture2D(tSame, vUv).rgb + c / 12.0 * uScatter, 1.0);
}`,D1=`
uniform sampler2D tScene; uniform sampler2D tBloom;
uniform float uBloom; uniform float uGrain; uniform float uTime; uniform float uAspect; uniform float uFlat;
uniform float uLift; uniform vec3 uVigCol; uniform float uVig;
varying vec2 vUv;
${df}
vec3 toSRGB(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
  if (uFlat > 0.5) { gl_FragColor = vec4(toSRGB(clamp(c, 0.0, 1.0)), 1.0); return; }
  vec3 b = texture2D(tBloom, vUv).rgb;
  c += b * uBloom;
  // soft shoulder: HDR glow rolls off into warm white instead of clipping flat
  vec3 k = vec3(0.78);
  c = mix(c, k + (1.0 - k) * (1.0 - exp(-(c - k) / (1.0 - k))), step(k, c));
  vec3 g = toSRGB(clamp(c, 0.0, 1.0));
  // grade in display space: indigo lift in the darks, a little extra saturation, a gentle S-curve
  float l = luma(g);
  g = mix(vec3(l), g, 1.1);
  g = mix(g, g * g * (3.0 - 2.0 * g), 0.18);
  g += vec3(0.022, 0.012, 0.05) * uLift * (1.0 - smoothstep(0.0, 0.35, l));
  // vignette toward deep plum, a touch stronger at the bottom so the HUD reads
  vec2 v = (vUv - 0.5) * vec2(uAspect, 1.0);
  float vig = smoothstep(0.35, 1.05, length(v * vec2(0.82, 1.0) + vec2(0.0, 0.04)));
  g = mix(g, g * uVigCol, vig * uVig);
  // fine grain, also dithers away banding in the dark gradients
  float n = hash(gl_FragCoord.xy + fract(uTime * 7.13) * 431.0) - 0.5;
  g += n * (uGrain + 1.0 / 255.0) * (1.0 - l * 0.5);
  gl_FragColor = vec4(clamp(g, 0.0, 1.0), 1.0);
}`,no=(s,t)=>new Ie({uniforms:t,vertexShader:P1,fragmentShader:s,depthTest:!1,depthWrite:!1});class U1{constructor(t,e="high"){this.renderer=t,this.float=t.extensions.has("EXT_color_buffer_float"),this.size=new ct,this.flat=!1,this.strength=.85,this.thr=this.float?1:.9,this.quad=new R1,this.prefilter=no(L1,{tScene:{value:null},uTexel:{value:new ct},uThr:{value:this.thr},uWarmThr:{value:.4}}),this.down=no(I1,{tSrc:{value:null},uTexel:{value:new ct}}),this.up=no(N1,{tSrc:{value:null},tSame:{value:null},uTexel:{value:new ct},uScatter:{value:.9}}),this.final=no(D1,{tScene:{value:null},tBloom:{value:null},uBloom:{value:this.strength},uGrain:{value:0},uTime:{value:0},uAspect:{value:1},uFlat:{value:0},uLift:{value:1},uVigCol:{value:new U(.32,.26,.42)},uVig:{value:.75}}),this.sceneRT=null,this.down_=[],this.up_=[],this.setQuality(e)}setDay(t){this.strength=dn(.85,.75,.4,t),this.prefilter.uniforms.uThr.value=this.thr*dn(1,1,1.5,t),this.prefilter.uniforms.uWarmThr.value=dn(.4,.45,1.1,t);const e=this.final.uniforms;e.uLift.value=dn(1,.8,.15,t),e.uVigCol.value.set(dn(.32,.4,.62,t),dn(.26,.26,.5,t),dn(.42,.42,.44,t)),e.uVig.value=dn(.75,.7,.45,t)}setQuality(t){this.quality=t,this.dispose(),this.size.set(0,0)}dispose(){this.sceneRT?.dispose();for(const t of[...this.down_,...this.up_])t.dispose();this.sceneRT=null,this.down_=[],this.up_=[]}build(t,e){this.dispose();const n=this.quality==="high",i=this.float?{type:Rs}:{type:An,colorSpace:Ue};this.sceneRT=new $n(t,e,{...i,samples:4});const r=n?2:4,o=n?5:3;for(let a=0;a<o;a++){const c=r<<a,l=()=>new $n(Math.max(1,Math.round(t/c)),Math.max(1,Math.round(e/c)),{...i,depthBuffer:!1});this.down_.push(l()),a<o-1&&this.up_.push(l())}this.final.uniforms.uGrain.value=n?.035:0,this.final.uniforms.uAspect.value=t/e}pass(t,e){this.quad.material=t,this.renderer.setRenderTarget(e),this.quad.render(this.renderer)}render(t,e,n){const i=this.renderer;if(this.quality==="off"){i.setRenderTarget(null),i.render(t,e);return}const r=i.getDrawingBufferSize(new ct);r.equals(this.size)||(this.size.copy(r),this.build(r.x,r.y)),i.setRenderTarget(this.sceneRT),i.render(t,e);const o=this.final.uniforms;if(o.tScene.value=this.sceneRT.texture,o.uTime.value=n,o.uFlat.value=this.flat?1:0,!this.flat){const a=this.down_,c=this.up_;this.prefilter.uniforms.tScene.value=this.sceneRT.texture,this.prefilter.uniforms.uTexel.value.set(1/r.x,1/r.y),this.pass(this.prefilter,a[0]);for(let h=1;h<a.length;h++)this.down.uniforms.tSrc.value=a[h-1].texture,this.down.uniforms.uTexel.value.set(.5/a[h-1].width,.5/a[h-1].height),this.pass(this.down,a[h]);let l=a[a.length-1];for(let h=c.length-1;h>=0;h--)this.up.uniforms.tSrc.value=l.texture,this.up.uniforms.tSame.value=a[h].texture,this.up.uniforms.uTexel.value.set(.5/l.width,.5/l.height),this.pass(this.up,c[h]),l=c[h];o.tBloom.value=l.texture,o.uBloom.value=this.strength/a.length}this.pass(this.final,null)}}const ci={coal:"#1d1726",plumDark:"#2e2038",wood:"#4a3340",stone:"#9a93ad",stoneDark:"#6f6a86",amber:"#ffc46b"};function pf(){return matchMedia("(pointer: coarse)").matches||"ontouchstart"in window||navigator.maxTouchPoints>0}const rr=512,wo=2,F1=`
uniform sampler2D tA; uniform sampler2D tB; uniform sampler2D tC; uniform sampler2D tD;
uniform mat4 uPart[NPARTS];
uniform vec2 uViewport; uniform float uSize;
uniform vec3 uLampPos[2]; uniform vec3 uLampCol; uniform float uInk;
attribute float splatIndex;
varying vec2 vP; varying vec4 vCol;
const vec3 MOON = vec3(${Ni.x.toFixed(4)}, ${Ni.y.toFixed(4)}, ${Ni.z.toFixed(4)});
mat3 quatMat(vec4 q) {
  float x = q.x, y = q.y, z = q.z, w = q.w;
  return mat3(1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y + w * z), 2.0 * (x * z - w * y),
              2.0 * (x * y - w * z), 1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z + w * x),
              2.0 * (x * z + w * y), 2.0 * (y * z - w * x), 1.0 - 2.0 * (x * x + y * y));
}
void main() {
  int i = int(splatIndex + 0.5);
  ivec2 uv = ivec2(i % ${rr}, i / ${rr});
  vec4 a = texelFetch(tA, uv, 0), q = texelFetch(tB, uv, 0), c = texelFetch(tC, uv, 0), d = texelFetch(tD, uv, 0);
  mat4 pm = uPart[int(a.w + 0.5)];
  vec4 world = pm * vec4(a.xyz, 1.0);
  vec4 view = viewMatrix * world;
  if (view.z > -0.1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }

  // 3D covariance in view space, then its 2D projection (EWA splatting)
  mat3 R = mat3(pm) * quatMat(q);
  vec3 s = c.xyz * uSize;
  mat3 M = mat3(viewMatrix) * mat3(R[0] * s.x, R[1] * s.y, R[2] * s.z);
  mat3 cov = M * transpose(M);
  float fx = projectionMatrix[0][0] * uViewport.x * 0.5, fy = projectionMatrix[1][1] * uViewport.y * 0.5;
  float iz = 1.0 / -view.z;
  mat3 J = mat3(fx * iz, 0.0, 0.0, 0.0, fy * iz, 0.0, fx * view.x * iz * iz, fy * view.y * iz * iz, 0.0);
  mat3 c2 = J * cov * transpose(J);
  float ca = c2[0][0] + 0.3, cb = c2[0][1], cd = c2[1][1] + 0.3;
  float mid = 0.5 * (ca + cd), rad = sqrt(max(mid * mid - (ca * cd - cb * cb), 1e-6));
  float l1 = mid + rad, l2 = max(mid - rad, 0.1);
  vec2 v1 = abs(cb) < 1e-5 ? (ca >= cd ? vec2(1.0, 0.0) : vec2(0.0, 1.0)) : normalize(vec2(cb, l1 - ca));
  vec2 v2 = vec2(-v1.y, v1.x);
  vec2 off = (position.x * v1 * min(sqrt(l1), 400.0) + position.y * v2 * min(sqrt(l2), 400.0)) * ${wo.toFixed(1)};
  vec4 clip = projectionMatrix * view;
  gl_Position = vec4(clip.xy + off / uViewport * 2.0 * clip.w, clip.zw);
  vP = position.xy * ${wo.toFixed(1)};

  // painterly lighting per dab: cold moon key with purple shadows, warm footlights, ink toward the silhouette
  vec3 N = normalize(R[2]);
  vec3 V = normalize(cameraPosition - world.xyz);
  if (dot(N, V) < 0.0) N = -N; // cloth is one layer of dabs seen from both sides
  float m = dot(N, MOON);
  vec3 light = mix(vec3(0.4, 0.35, 0.62), vec3(0.72, 0.7, 1.0), smoothstep(-0.3, 0.05, m));
  light = mix(light, vec3(1.1, 1.12, 1.28), smoothstep(0.2, 0.55, m));
  for (int k = 0; k < 2; k++) {
    vec3 L = uLampPos[k] - world.xyz;
    float r2 = dot(L, L);
    light += uLampCol * (clamp(dot(N, L * inversesqrt(r2)) * 0.6 + 0.4, 0.0, 1.0) / (1.0 + r2 * 0.35));
  }
  float edge = 1.0 - abs(dot(N, V));
  vec3 col = d.rgb * light * mix(1.0, 0.22, smoothstep(0.5, 0.92, edge) * uInk);
  vCol = vec4(mix(col, d.rgb, d.a), c.w);
}`,z1=`
uniform float uSharp;
varying vec2 vP; varying vec4 vCol;
void main() {
  float g = exp(-0.5 * dot(vP, vP)) - ${Math.exp(-.5*wo*wo).toFixed(4)}; // falls to zero at the quad's edge
  // uSharp flattens the top of the Gaussian: a dab is an opaque disc with a narrow soft rim, like gouache
  float al = vCol.a * clamp(g * uSharp, 0.0, 1.0);
  if (al < 0.004) discard;
  gl_FragColor = vec4(vCol.rgb * al, al);
  #include <colorspace_fragment>
}`;class O1{constructor(t){this.nParts=t,this.n=0,this.data=[[],[],[],[]],this.parts=Array.from({length:t},()=>new Zt)}add(t,e,n,i,r,o,a=.95,c=0){const l=V1.copy(n).normalize(),h=B1.copy(i).addScaledVector(l,-i.dot(l));h.lengthSq()<1e-8&&h.set(l.y,l.z,l.x).addScaledVector(l,-(l.y*l.x+l.z*l.y+l.x*l.z)),h.normalize();const f=k1.crossVectors(l,h);js.setFromRotationMatrix(kh.makeBasis(h,f,l)),this.data[0].push(e.x,e.y,e.z,t),this.data[1].push(js.x,js.y,js.z,js.w),this.data[2].push(r[0],r[1],r[2],a),this.data[3].push(o.r,o.g,o.b,c),this.n++}build(){const t=this.n,e=Math.ceil(t/rr),n=this.data.map(r=>{const o=new Float32Array(rr*e*4);o.set(r);const a=new Rv(o,rr,e,en,bn);return a.needsUpdate=!0,a});this.centers=new Float32Array(this.data[0]),this.data=null,this.order=new Float32Array(t),this.depth=new Float32Array(t),this.counts=new Uint32Array(65537);const i=new l_;return i.setAttribute("position",new xe(new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]),3)),i.setIndex([0,1,2,0,2,3]),this.attr=new Pv(this.order,1),this.attr.setUsage(pd),i.setAttribute("splatIndex",this.attr),i.instanceCount=t,this.material=new Ie({defines:{NPARTS:this.nParts},uniforms:{tA:{value:n[0]},tB:{value:n[1]},tC:{value:n[2]},tD:{value:n[3]},uPart:{value:this.parts},uViewport:{value:new ct(1,1)},uSize:{value:.85},uSharp:{value:6},uInk:{value:1},uLampPos:{value:[new U,new U]},uLampCol:{value:new zt(1,.62,.3)}},vertexShader:F1,fragmentShader:z1,transparent:!0,depthWrite:!1,premultipliedAlpha:!0,blending:pu,blendSrc:Oa,blendDst:ar,blendSrcAlpha:Oa,blendDstAlpha:ar}),this.mesh=new ce(i,this.material),this.mesh.frustumCulled=!1,this.mesh.renderOrder=10,this.mesh}sort(t){const e=this.n,n=this.centers,i=this.depth,r=this._rows||(this._rows=new Float32Array(this.nParts*4));for(let f=0;f<this.nParts;f++){const u=kh.multiplyMatrices(t.matrixWorldInverse,this.parts[f]).elements;r[f*4]=u[2],r[f*4+1]=u[6],r[f*4+2]=u[10],r[f*4+3]=u[14]}let o=1/0,a=-1/0;for(let f=0,u=0;f<e;f++,u+=4){const d=n[u+3]*4,m=r[d]*n[u]+r[d+1]*n[u+1]+r[d+2]*n[u+2]+r[d+3];i[f]=m,m<o&&(o=m),m>a&&(a=m)}const c=this.counts,l=65535/Math.max(a-o,1e-6);c.fill(0);for(let f=0;f<e;f++)c[(i[f]-o)*l|0]++;for(let f=0,u=0;f<65536;f++){const d=c[f];c[f]=u,u+=d}const h=this.order;for(let f=0;f<e;f++)h[c[(i[f]-o)*l|0]++]=f;this.attr.needsUpdate=!0}}const B1=new U,k1=new U,V1=new U,js=new sn,kh=new Zt;class G1{constructor(t,e){this.cloud=t,this.rand=e,this.partIndex=0,this.colors=new Map}part(t){return this.partIndex=t,this}_col(t){let e=this.colors.get(t);return e||this.colors.set(t,e=new zt(t)),e}_dab(t,e,n,i,r=0,o=0,a=null,c=1/0){if(i.keep&&!i.keep(t,e,r,o))return;const l=this.rand,h=(i.size||Gh)*Vh;let f=typeof i.color=="function"?i.color(t,e,r,o):i.color;if(!f)return;c<(i.ink??.009)&&(f=q1);const u=this._col(f),d=Y1.copy(t).applyMatrix4(n),m=$1.copy(e).transformDirection(n),v=j1;a&&a.lengthSq()>1e-12?v.copy(a).transformDirection(n):v.crossVectors(m,i.hint?$h.fromArray(i.hint).transformDirection(n):$h.set(0,1,0)),v.lengthSq()<1e-4&&v.set(1,0,0),v.normalize().applyAxisAngle(m,(l()-.5)*.9);const g=i.flat?1:.8+l()*.45,p=1+(l()-.5)*.14+(H1(d.x*7,d.y*7,d.z*7)-.5)*.2;jh.copy(u).multiplyScalar(i.emissive?1:p);const _=i.flat?h:h*1.35*g,y=i.flat?h*.8:h*.8*g;this.cloud.add(this.partIndex,d,m,v,[_,y,h*.3],jh,i.alpha??.95,i.emissive||0)}_count(t,e){return Math.max(6,Math.round((e.density||1)*t/(((e.size||Gh)*Vh)**2*.9)))}_mat(t,e){return new Zt().compose(new U(...t||[0,0,0]),new sn().setFromEuler(new rn(...e||[0,0,0])),Hh)}surf(t){const e=this._mat(t.c,t.rot),n=this.rand,i=t.f,[r,o]=t.grid||[36,24],a=[],c=new Float64Array(r*o);for(let f=0;f<=o;f++)for(let u=0;u<=r;u++)a.push(i(u/r,f/o,new U));let l=0;for(let f=0;f<o;f++)for(let u=0;u<r;u++){const d=a[f*(r+1)+u],m=a[f*(r+1)+u+1],v=a[(f+1)*(r+1)+u],g=a[(f+1)*(r+1)+u+1];l+=La.subVectors(m,d).cross(ro.subVectors(g,d)).length()*.5+La.subVectors(g,d).cross(ro.subVectors(v,d)).length()*.5,c[f*r+u]=l}const h=.001;for(let f=this._count(l,t);f>0;f--){const u=n()*l;let d=0,m=c.length-1;for(;d<m;){const p=d+m>>1;c[p]<u?d=p+1:m=p}const v=(d%r+n())/r,g=((d/r|0)+n())/o;i(v,g,Ne),i(Math.min(1,v+h),g,ss).sub(i(Math.max(0,v-h),g,ro)),i(v,Math.min(1,g+h),rs).sub(i(v,Math.max(0,g-h),ro)),ye.crossVectors(ss,rs),ye.lengthSq()<1e-18?ye.set(0,1,0):ye.normalize(),this._dab(Ne,ye,e,t,v,g,t.along==="v"?rs:ss,t.edge?t.edge(v,g,Ne):1/0)}return this}loft(t){const e=t.st.map(m=>[m[0],m[1],m[2]??m[1],m[3]||0,m[4]||0,m[5]??t.n??2]),n=e.length-1,i=t.smooth!==!1,[r,o]=t.arc||[0,so],a=!!t.arc,c=new Float64Array(6),l=m=>{const v=Math.min(.99999,Math.max(0,m))*n,g=Math.floor(v),p=v-g,_=e[Math.max(0,g-1)],y=e[g],x=e[g+1],C=e[Math.min(n,g+2)];for(let w=0;w<6;w++)c[w]=i?io(_[w],y[w],x[w],C[w],p):y[w]+(x[w]-y[w])*p;return c},h=(m,v,g,p)=>{const _=Math.cos(m),y=Math.sin(m),x=2/Math.max(.5,v[5]);return p.set(v[3]+Math.sign(_)*Math.abs(_)**x*Math.max(0,v[1])*g,v[0],v[4]+Math.sign(y)*Math.abs(y)**x*Math.max(0,v[2])*g)},f=t.hem,u=e[0][0],d=f?m=>{const v=m*f.teeth,g=Math.floor(v),p=.35+.65*W1(g*12.9898+(f.seed||0));return f.depth*p*Math.abs(2*(v-g)-1)**.85}:null;this.surf({...t,grid:t.grid||[40,Math.max(12,n*8)],f:(m,v,g)=>{const p=r+(o-r)*m,_=l(v);return h(p,_,1+(t.pleat?t.pleat(p,v):0),g)},keep:(m,v,g,p)=>(!d||m.y-u>d(g))&&(!t.keep||t.keep(m,v,g,p)),edge:(m,v,g)=>{let p=1/0;return d&&(p=g.y-u-d(m)),a&&(p=Math.min(p,Math.min(m,1-m)*(o-r)*Math.max(l(v)[1],c[2]))),p}});for(const[m,v]of[[t.top,n],[t.bottom,0]]){if(!m)continue;const g=Float64Array.from(e[v]);this.surf({...t,grid:[28,5],keep:t.keep,f:(p,_,y)=>h(so*p,g,_,y),along:"u"})}return this}tube(t){const e=t.pts.map(v=>new U(...v)),n=e.length-1,i=t.smooth!==!1,r=e.map((v,g)=>{const p=Array.isArray(t.r)?t.r[Math.min(g,t.r.length-1)]:t.r;return Array.isArray(p)?p:[p,p]}),o=48,a=[],c=new U(...t.up||[0,0,1]),l=2/(t.n||2),h=(v,g)=>{const p=Math.min(.99999,Math.max(0,v))*n,_=Math.floor(p),y=p-_,x=e[Math.max(0,_-1)],C=e[_],w=e[_+1],T=e[Math.min(n,_+2)];return i?g.set(io(x.x,C.x,w.x,T.x,y),io(x.y,C.y,w.y,T.y,y),io(x.z,C.z,w.z,T.z,y)):g.lerpVectors(C,w,y)},f=v=>{const g=Math.min(.99999,Math.max(0,v))*n,p=Math.floor(g),_=g-p;return[r[p][0]+(r[p+1][0]-r[p][0])*_,r[p][1]+(r[p+1][1]-r[p][1])*_]};let u=null;for(let v=0;v<=o;v++){const g=v/o,p=h(g,new U),_=h(Math.min(1,g+.001),new U).sub(h(Math.max(0,g-.001),La)).normalize();u=(u?u.clone():c.clone()).addScaledVector(_,-(u||c).dot(_)),u.lengthSq()<1e-8&&u.set(_.y,_.z,_.x).addScaledVector(_,-(_.y*_.x+_.z*_.y+_.x*_.z)),u.normalize(),a.push({p,t:_,n:u,b:new U().crossVectors(_,u)})}const d=v=>{const g=Math.min(.99999,Math.max(0,v))*o,p=Math.floor(g),_=g-p,y=a[p],x=a[p+1];Wh.lerpVectors(y.p,x.p,_),qh.lerpVectors(y.n,x.n,_).normalize(),Xh.lerpVectors(y.b,x.b,_).normalize(),Yh.lerpVectors(y.t,x.t,_).normalize()},m=(v,g,p,_)=>{const y=Math.cos(v*so),x=Math.sin(v*so);return _.copy(Wh).addScaledVector(Xh,Math.sign(y)*Math.abs(y)**l*g).addScaledVector(qh,Math.sign(x)*Math.abs(x)**l*p)};if(this.surf({...t,grid:t.grid||[20,Math.max(16,n*10)],f:(v,g,p)=>{d(g);const[_,y]=f(g);return m(v,_,y,p)}}),t.cap!==!1)for(const[v,g]of[[0,-1],[1,1]]){const[p,_]=f(v);if(Math.min(p,_)<.006)continue;const y=Math.min(p,_)*(t.cap==="flat"?0:.8)*g;this.surf({...t,grid:[18,5],f:(x,C,w)=>{d(v);const T=Math.cos(C*Math.PI/2);return m(x,p*T,_*T,w).addScaledVector(Yh,Math.sin(C*Math.PI/2)*y)}})}return this}sheet(t){const e=this._mat(t.c,t.rot),n=this.rand,i=t.pts,r=i.length,o=t.bend||(()=>0);let a=1/0,c=-1/0,l=1/0,h=-1/0,f=0;for(let d=0;d<r;d++){const[m,v]=i[d],[g,p]=i[(d+1)%r];a=Math.min(a,m),c=Math.max(c,m),l=Math.min(l,v),h=Math.max(h,v),f+=m*p-g*v}const u=.001;for(let d=this._count(Math.abs(f)/2,t),m=d*40;d>0&&m>0;m--){const v=a+n()*(c-a),g=l+n()*(h-l);let p=!1,_=1/0;for(let y=0,x=r-1;y<r;x=y++){const[C,w]=i[y],[T,R]=i[x];w>g!=R>g&&v<(T-C)*(g-w)/(R-w)+C&&(p=!p);const S=T-C,M=R-w,P=Math.max(0,Math.min(1,((v-C)*S+(g-w)*M)/(S*S+M*M||1)));_=Math.min(_,Math.hypot(v-C-S*P,g-w-M*P))}p&&(d--,Ne.set(v,g,o(v,g)),ss.set(2*u,0,o(v+u,g)-o(v-u,g)),rs.set(0,2*u,o(v,g+u)-o(v,g-u)),this._dab(Ne,ye.crossVectors(ss,rs).normalize(),e,t,v,g,t.along==="u"?ss:rs,_))}return this}ellipsoid(t){const[e,n,i]=t.r,r=this._mat(t.c,t.rot),o=1.6075,a=4*Math.PI*(((e*n)**o+(e*i)**o+(n*i)**o)/3)**(1/o),c=this._count(a,t),l=this.rand()*10;for(let h=0;h<c;h++){const f=1-2*(h+.5)/c,u=Math.sqrt(1-f*f),d=(h+l)*2.39996323,m=Math.cos(d)*u,v=Math.sin(d)*u;this._dab(Ne.set(m*e,f*n,v*i),ye.set(m/e,f/n,v/i).normalize(),r,t)}return this}capsule(t){const e=new U(...t.a),n=new U(...t.b),i=t.ra,r=t.rb??t.ra,o=n.clone().sub(e),a=o.length(),c=new sn().setFromUnitVectors(X1,o.clone().normalize()),l=new Zt().compose(e,c,Hh),h=this.rand,f=(i-r)/a;for(let u=this._count(Math.PI*(i+r)*a,t);u>0;u--){const d=h(),m=h()*Math.PI*2,v=i+(r-i)*d;this._dab(Ne.set(Math.cos(m)*v,d*a,Math.sin(m)*v),ye.set(Math.cos(m),f,Math.sin(m)).normalize(),l,t)}for(const[u,d,m]of[[i,0,-1],[r,a,1]])for(let v=this._count(2*Math.PI*u*u,t);v>0;v--){const g=h()*2-1,p=h()*Math.PI*2,_=Math.sqrt(1-g*g);ye.set(Math.cos(p)*_,Math.abs(g)*m,Math.sin(p)*_),this._dab(Ne.copy(ye).multiplyScalar(u).setY(ye.y*u+d),ye,l,t)}return this}frustum(t){const e=this._mat(t.c,t.rot),n=this.rand,{r0:i,r1:r,h:o}=t,a=(i-r)/o;for(let c=this._count(Math.PI*(i+r)*Math.hypot(o,i-r),t);c>0;c--){const l=n(),h=n()*Math.PI*2,f=i+(r-i)*l;this._dab(Ne.set(Math.cos(h)*f,(l-.5)*o,Math.sin(h)*f),ye.set(Math.cos(h),a,Math.sin(h)).normalize(),e,t)}for(const[c,l,h,f]of[[t.top!==!1,r,o/2,1],[t.bottom,i,-o/2,-1]])if(!(!c||l<=0))for(let u=this._count(Math.PI*l*l,t);u>0;u--){const d=Math.sqrt(n())*l,m=n()*Math.PI*2;this._dab(Ne.set(Math.cos(m)*d,h,Math.sin(m)*d),ye.set(0,f,0),e,t)}return this}box(t){const e=this._mat(t.c,t.rot),n=this.rand,[i,r,o]=t.h,a=[[0,r*o],[1,i*o],[2,i*r]];for(const[c,l]of a)for(const h of[-1,1])for(let f=this._count(4*l,t);f>0;f--){const u=n()*2-1,d=n()*2-1;c===0?(Ne.set(h*i,u*r,d*o),ye.set(h,0,0)):c===1?(Ne.set(u*i,h*r,d*o),ye.set(0,h,0)):(Ne.set(u*i,d*r,h*o),ye.set(0,0,h)),this._dab(Ne,ye,e,t)}return this}torus(t){const e=this._mat(t.c,t.rot),n=this.rand,i=t.squash??1;for(let r=this._count(4*Math.PI*Math.PI*t.R*t.r,t);r>0;r--){const o=n()*Math.PI*2,a=n()*Math.PI*2,c=t.R+t.r*Math.cos(a);this._dab(Ne.set(c*Math.cos(o),t.r*Math.sin(a)*i,c*Math.sin(o)),ye.set(Math.cos(a)*Math.cos(o),Math.sin(a)/i,Math.cos(a)*Math.sin(o)).normalize(),e,t)}return this}}function ri(s,t,e){const n=Math.sin(s*127.1+t*311.7+e*74.7)*43758.5453;return n-Math.floor(n)}function H1(s,t,e){const n=Math.floor(s),i=Math.floor(t),r=Math.floor(e),o=s-n,a=t-i,c=e-r,l=o*o*(3-2*o),h=a*a*(3-2*a),f=c*c*(3-2*c),u=(d,m,v)=>d+(m-d)*v;return u(u(u(ri(n,i,r),ri(n+1,i,r),l),u(ri(n,i+1,r),ri(n+1,i+1,r),l),h),u(u(ri(n,i,r+1),ri(n+1,i,r+1),l),u(ri(n,i+1,r+1),ri(n+1,i+1,r+1),l),h),f)}function W1(s){const t=Math.sin(s)*43758.5453;return t-Math.floor(t)}function io(s,t,e,n,i){return .5*(2*t+(e-s)*i+(2*s-5*t+4*e-n)*i*i+(3*t-s-3*e+n)*i*i*i)}const Vh=.78,Gh=.02,q1="#17111f",so=Math.PI*2,Hh=new U(1,1,1),X1=new U(0,1,0),La=new U,ro=new U,ss=new U,rs=new U,Wh=new U,qh=new U,Xh=new U,Yh=new U,Y1=new U,$1=new U,j1=new U,$h=new U,Ne=new U,ye=new U,jh=new zt,Ye="#17111f",Xe="#2a2136",Zh="#272033",oo="#d8d2dc",bi="#c9913a",Kh="#ffc46b",vs=Math.PI*2,os=Math.PI/2,mf=s=>s-Math.floor(s),Z1=s=>Math.abs(2*mf(s)-1),Zs=(s,t,e)=>(n,i,r,o)=>Math.floor(o*e)%2?s:t;function Ia(s,t,e,n,i){const r=a=>Array.isArray(a)?a.map(r):a+.004,o=t==="loft"?{st:e.st.map(a=>[a[0],a[1]+.004,(a[2]??a[1])+.004,a[3]||0,a[4]||0,a[5]])}:{r:r(e.r)};s[t]({...e,...o,color:i,size:.0065,along:"v",ink:0,top:!1,bottom:!1,cap:!1,keep:(a,c,l,h)=>mf(l*n+.5)<.1&&(!e.keep||e.keep(a,c,l,h))})}const as=(s,t,e=0,n=1.5)=>(i,r)=>t*(1-r)**n*(Z1(i/vs*s+e)-.5),Je=s=>{s(1),s(-1)};function fe(s,t,e,n,i=.007){for(let r=0;r<t.length-1;r++)s.capsule({a:t[r],b:t[r+1],ra:e,color:n,size:i,density:1.4,flat:!0})}const Ks=(s,t,e,n,i,r,o=Ye)=>s.ellipsoid({c:[t,e,n],r:[i,r,.012],color:o,size:.008,density:1.5,flat:!0}),Jh=(s,t,e,n,i=.008)=>s.ellipsoid({c:[t,e,n],r:[i,i,i*.6],color:"#fff8e8",size:.005,density:2,emissive:1,flat:!0});function Js(s,t,[e,n,i],r,o){s.tube({pts:[[e,n,i],[e+t*.012*r,n-.06*r,i+.005],[e+t*.016*r,n-.13*r,i+.012],[e+t*.008*r,n-.178*r,i+.02]],r:[[.05*r,.042*r],[.084*r,.06*r],[.088*r,.062*r],[.052*r,.04*r]],color:o,size:.015}),s.tube({pts:[[e-t*.045*r,n-.045*r,i+.03*r],[e-t*.085*r,n-.08*r,i+.06*r],[e-t*.088*r,n-.125*r,i+.072*r]],r:[.031*r,.031*r,.022*r],color:o,size:.011})}function ao(s,t,e){const n=e.k||1,i=e.toe||e.color;s.loft({st:[[.05,.078*n,.088*n,t,-.02*n],[.13,.074*n,.082*n,t,-.024*n],[e.top,.088*n,.094*n,t,-.024*n]],n:2.7,color:e.color,size:.015,top:!0}),s.tube({pts:[[t,.066*n,-.095*n],[t,.064*n,.03*n],[t,.076*n,.135*n],[t,.066*n,.2*n]],r:[[.076*n,.064*n],[.084*n,.064*n],[.106*n,.076*n],[.086*n,.062*n]],up:[0,1,0],n:2.5,size:.015,color:r=>r.y<.022*n?Ye:r.z>.105*n?i:e.color}),e.cuff&&s.loft({st:[[e.top-.065,.104*n,.11*n,t,-.024*n],[e.top+.012,.098*n,.104*n,t,-.024*n]],n:2.7,color:e.cuff,size:.014})}function Na(s,t){const[e,n]=t.brim,i=.45,r=t.curl??.04;s.surf({c:t.c,rot:t.rot,color:t.color,size:.016,grid:[40,6],along:"u",f:(h,f,u)=>{const d=h*vs,m=i+(1-i)*f,v=Math.cos(d),g=Math.sin(d);return u.set(v*e*m,f*f*(r*v*v-r*.5*g*g+(t.wobble??.012)*Math.sin(d*3+1)),g*n*m)},edge:(h,f)=>(1-f)*(1-i)*Math.min(e,n)}),s.loft({c:t.c,rot:t.rot,st:t.crown,n:t.n??2.5,smooth:!1,top:!0,color:t.color,size:.017});const[o,a]=t.crown,c=Math.min(1,.062/(a[0]-o[0])),l=h=>o[h]+((a[h]??0)-(o[h]??0))*c||0;s.loft({c:t.c,rot:t.rot,st:[[o[0]+.004,o[1]+.007,(o[2]??o[1])+.007,o[3]||0,o[4]||0],[l(0),l(1)+.007,l(2)+.007,l(3),l(4)]],n:t.n??2.5,color:t.band,size:.012})}const Da=(s,t,e,n)=>s.sheet({c:t,rot:n,pts:[[-e,-e*.8],[e,-e*.8],[e,e*.8],[-e,e*.8]],keep:i=>Math.max(Math.abs(i.x),Math.abs(i.y)*1.25)>e*.5,color:bi,size:.007,ink:0,density:1.6});function Qh(s,t,e,n,i,r,o=.03){const a=[];for(let c=-1;c<=9;c++){const l=c/8*vs+.4;a.push([Math.cos(l)*e,t+Math.sin(l)*o,Math.sin(l)*n])}s.tube({pts:a,r:i,up:[0,1,0],color:r,size:.013,cap:!1,grid:[14,64]})}function Ua(s,t,e,n,i){s.tube({pts:t,r:[[e,.014]],color:n,size:.012,n:3,cap:"flat"});const[r,o]=[t[t.length-1],t[t.length-2]],a=[r[0]-o[0],r[1]-o[1],r[2]-o[2]],c=Math.hypot(...a);for(let l=-2;l<=2;l++){const h=l/2*e*.85,f=.05+(l*7+13)%5*.006;s.capsule({a:[r[0]+h,r[1],r[2]],b:[r[0]+h+a[0]/c*f,r[1]+a[1]/c*f,r[2]+a[2]/c*f],ra:.006,color:i,size:.006,density:1.4,flat:!0})}}const Fs=[{name:"Mortimer",role:"foreman",color:bi,rig:{body:{c:[0,.66,0],r:[.33,.36,.29]},head:{c:[0,1.25,0],r:.19},neck:[0,1.06,0],shoulder:[.27,.93,0],hand:[.44,.47,.03],armR:.07,hip:[.13,.3,0],legR:.09},paint(s,t){const e="#44325a",n="#241c30",i="#3d2c52",r=Zs(bi,i,15);s.part(t.body),s.loft({st:[[.265,.17,.16],[.32,.31,.27],[.45,.375,.32,0,.012],[.6,.36,.31,0,.012],[.76,.28,.25],[.9,.19,.18],[1.03,.11,.11]],bottom:!0,color:e}),s.loft({st:[[.71,.5,.4],[.9,.34,.285],[1.05,.13,.12]],smooth:!1,n:2.5,hem:{teeth:9,depth:.17,seed:1},pleat:as(9,.12,.5),color:n,size:.017}),Qh(s,1.08,.165,.15,[.05,.062],r),Ua(s,[[.07,1.05,.17],[.115,.93,.25],[.125,.79,.315],[.13,.65,.335]],.058,Zs(bi,i,9),bi),s.part(t.head),s.ellipsoid({c:[0,1.25,0],r:[.205,.185,.19],color:oo}),Je(o=>{Ks(s,o*.07,1.27,.178,.02,.026),Jh(s,o*.064,1.279,.19),fe(s,[[o*.028,1.325,.18],[o*.1,1.305,.163]],.007,Ye),s.tube({pts:[[0,1.207,.192],[o*.05,1.192,.186],[o*.092,1.206,.166],[o*.108,1.234,.15]],r:[.017,.016,.01,.004],color:Ye,size:.008})}),fe(s,[[-.022,1.168,.186],[0,1.175,.19],[.022,1.168,.186]],.006,Ye),Na(s,{c:[0,1.39,0],rot:[.05,0,.09],brim:[.3,.27],curl:.045,color:Xe,band:bi,n:2.4,crown:[[0,.152,.142],[.075,.14,.13],[.2,.122,.116,.012],[.3,.15,.14,.045],[.4,.192,.176,.028]]}),fe(s,[[.07,1.58,.128],[.03,1.64,.125],[.085,1.69,.14]],.005,Ye),Je(o=>{s.part(o>0?t.armL:t.armR),s.tube({pts:[[o*.27,.95,0],[o*.375,.8,.01],[o*.428,.62,.02]],r:[.06,.068,.062],color:oo,size:.017}),Js(s,o,[o*.432,.615,.02],1.15,Xe),s.part(o>0?t.legL:t.legR),s.tube({pts:[[o*.13,.32,0],[o*.13,.19,0]],r:.048,color:oo,size:.015,cap:!1}),ao(s,o*.13,{k:1.12,top:.215,color:Xe})})}},{name:"Peg",role:"jointed puppet",color:"#d9912f",rig:{body:{c:[0,.8,0],r:[.2,.3,.17]},head:{c:[0,1.3,0],r:.2},neck:[0,1.09,0],shoulder:[.255,.98,0],hand:[.37,.5,.02],armR:.075,hip:[.12,.5,0],legR:.09},paint(s,t){const e="#8d8696",n="#7b7486",i="#d9912f",r="#e0a030",o="#33273f",a="#5c4a78",c=(l,h,f)=>Math.sin(f*70+Math.sin(l.y*9)*2)>.72?n:e;s.part(t.body),s.loft({st:[[.47,.1,.09],[.53,.2,.165],[.64,.235,.19],[.78,.168,.148],[.9,.208,.172],[1,.19,.16],[1.065,.09,.085]],top:!0,bottom:!0,n:2.2,color:c}),s.loft({st:[[1.055,.047],[1.13,.04]],color:n,size:.012}),fe(s,[[-.05,.885,.166],[.05,.945,.16]],.011,"#4a3a66",.008),fe(s,[[.05,.885,.166],[-.05,.945,.16]],.011,"#4a3a66",.008),Qh(s,1.1,.165,.15,[.055,.062],Zs(a,o,15)),Ua(s,[[.1,1.07,.14],[.135,.98,.185],[.14,.87,.19],[.15,.78,.175]],.05,Zs(a,o,8),a),Ua(s,[[.12,1.09,.1],[.24,1.07,.06],[.34,1.11,0],[.44,1.08,-.05]],.05,Zs(a,o,8),a),s.part(t.head),s.ellipsoid({c:[0,1.3,0],r:[.212,.2,.2],color:"#a19baa"}),Je(l=>{s.ellipsoid({c:[l*.125,1.245,.155],r:[.04,.03,.015],color:"#cf8f8c",size:.012,alpha:.7}),Ks(s,l*.075,1.308,.19,.034,.03,"#3c3352"),s.ellipsoid({c:[l*.075,1.326,.197],r:[.042,.02,.012],rot:[0,0,l*-.25],color:"#7d7590",size:.008,density:1.5,flat:!0}),fe(s,[[l*.03,1.365,.19],[l*.11,1.345,.168]],.006,"#5e566c")}),fe(s,[[-.03,1.218,.2],[0,1.232,.206],[.03,1.218,.2]],.006,Ye),Na(s,{c:[0,1.478,0],rot:[0,0,.13],brim:[.275,.25],curl:.03,color:Zh,band:a,crown:[[0,.16,.15],[.1,.15,.14],[.225,.178,.166]]}),Da(s,[.004,1.512,.162],.034),fe(s,[[.262,1.505,.02],[.266,1.452,.02]],.005,Ye),s.frustum({c:[.266,1.445,.02],r0:.032,r1:.008,h:.025,color:Xe,size:.008}),s.ellipsoid({c:[.266,1.405,.02],r:[.026,.034,.026],color:Kh,emissive:1,size:.01,density:2}),s.frustum({c:[.266,1.368,.02],r0:.02,r1:.03,h:.014,color:Xe,size:.008,bottom:!0}),Je(l=>{s.part(l>0?t.armL:t.armR),s.ellipsoid({c:[l*.25,.98,0],r:[.038,.038,.038],color:r,size:.011}),s.tube({pts:[[l*.265,.96,0],[l*.33,.79,0],[l*.366,.66,.008]],r:[.045,.07,.086],color:c,size:.016,cap:"flat"}),s.tube({pts:[[l*.36,.672,.008],[l*.38,.59,.012]],r:.1,n:2.6,color:o,size:.014,cap:"flat"}),Js(s,l,[l*.382,.6,.012],1.2,i),s.part(l>0?t.legL:t.legR),s.ellipsoid({c:[l*.12,.5,0],r:[.038,.038,.038],color:r,size:.011}),s.tube({pts:[[l*.12,.48,0],[l*.12,.28,0]],r:[.058,.086],color:c,size:.016,cap:!1}),ao(s,l*.12,{k:1.15,top:.3,color:Xe,toe:i})})}},{name:"Mr. Sack",role:"the client",color:"#8d76ad",rig:{body:{c:[0,.98,0],r:[.21,.3,.15]},head:{c:[0,1.56,0],r:.2},neck:[0,1.34,0],shoulder:[.235,1.22,0],hand:[.3,.66,.01],armR:.05,hip:[.09,.7,0],legR:.07},paint(s,t){const e="#2c2439",n="#8a76ad",i="#9a94a0",r="#6f687a",o="#e8e2ee",a="#7a4fa8";s.part(t.body);const c={st:[[.58,.225,.145],[.76,.2,.135],[.96,.168,.12],[1.17,.232,.132],[1.255,.236,.126],[1.305,.1,.09],[1.345,.05,.05]],smooth:!1,n:3.4,size:.017,keep:h=>!(h.z>0&&h.y<.58+.2*Math.max(0,1-Math.abs(h.x)/.11))&&!(h.z<0&&h.y<.58+.26*Math.max(0,1-Math.abs(h.x)/.03))};s.loft({...c,color:e}),Ia(s,"loft",c,26,n),s.sheet({c:[0,0,.127],pts:[[-.075,1.31],[.075,1.31],[0,1.02]],color:o,size:.012,ink:0}),Je(h=>{s.sheet({c:[0,0,.133],pts:[[h*.015,1.32],[h*.135,1.3],[h*.105,1.19],[h*.012,.99]],bend:f=>-Math.abs(f)*.12,color:"#3b3050",size:.011}),s.sheet({c:[0,0,.143],pts:[[0,1.3],[h*.085,1.345],[h*.08,1.255]],color:a,size:.009}),s.sheet({c:[0,0,.12],rot:[-.3,0,0],pts:[[h*.012,1.345],[h*.1,1.36],[h*.05,1.29]],color:o,size:.009})}),s.ellipsoid({c:[0,1.3,.146],r:[.017,.02,.012],color:"#5d3a85",size:.007,density:1.5,flat:!0});for(const h of[1.13,1.04])Ks(s,0,h,.133,.011,.011,r);fe(s,[[-.16,.8,.139],[-.1,.87,.14]],.005,"#8d76ad");for(const h of[.3,.7])fe(s,[[-.16+h*.06-.014,.8+h*.07+.012,.142],[-.16+h*.06+.014,.8+h*.07-.012,.142]],.004,"#8d76ad");s.tube({pts:[[0,1.3,0],[0,1.41,0]],r:.042,color:r,size:.012,cap:!1}),s.part(t.head),s.loft({st:[[1.37,.07,.07],[1.42,.165,.155],[1.52,.212,.195,.008],[1.64,.225,.205,.016],[1.725,.165,.155,.022],[1.765,.06,.06,.024]],top:!0,bottom:!0,color:i}),Je(h=>{s.ellipsoid({c:[h*.088+.014,1.61,.176],r:[.06,.055,.02],color:r,size:.011,density:1.3}),fe(s,[[h*.088-.016,1.64,.2],[h*.088+.044,1.58,.2]],.007,Xe),fe(s,[[h*.088+.044,1.64,.2],[h*.088-.016,1.58,.2]],.007,Xe)});const l=[[-.12,1.5,.153],[-.065,1.468,.182],[.005,1.457,.192],[.075,1.468,.182],[.13,1.5,.153]];fe(s,l,.006,Xe);for(const[h,f,u]of l)fe(s,[[h,f+.022,u+.004],[h,f-.022,u+.004]],.005,Xe);fe(s,[[-.05,1.742,.1],[.04,1.757,.07]],.006,"#5e5868");for(const h of[.3,.7])fe(s,[[-.05+h*.09,1.77,.1-h*.03],[-.05+h*.09,1.73,.115-h*.03]],.005,"#5e5868");Je(h=>{s.part(h>0?t.armL:t.armR);const f={pts:[[h*.235,1.215,0],[h*.278,.98,0],[h*.296,.78,.01]],r:[.056,.048,.043],n:2.8,size:.014};s.tube({...f,color:e,cap:"flat"}),Ia(s,"tube",f,7,n),s.tube({pts:[[h*.296,.79,.01],[h*.3,.748,.01]],r:.048,color:o,size:.01,cap:"flat"}),Js(s,h,[h*.3,.755,.01],.72,"#8a8491"),s.part(h>0?t.legL:t.legR);const u={pts:[[h*.09,.7,0],[h*.086,.4,0],[h*.086,.07,0]],r:[.088,.07,.058],n:2.8,size:.015};s.tube({...u,color:e,cap:!1}),Ia(s,"tube",u,9,n),s.tube({pts:[[h*.086,.036,-.06],[h*.086,.04,.06],[h*.086,.03,.2],[h*.086,.012,.31]],r:[[.056,.035],[.06,.04],[.046,.03],[.012,.01]],up:[0,1,0],color:Ye,size:.012})})}},{name:"Hood",role:"night hauler",color:"#7a52a8",rig:{body:{c:[0,.56,0],r:[.3,.31,.27]},head:{c:[0,.98,0],r:.22},neck:[0,.8,0],shoulder:[.27,.72,0],hand:[.43,.42,.06],armR:.05,hip:[.11,.27,0],legR:.07},paint(s,t){const e="#5a3878",n="#46295e",i="#6a4490",r="#2a2337",o="#3a3049",a="#5c4632";s.part(t.body),s.loft({st:[[.215,.14,.13],[.27,.26,.24],[.42,.318,.288,0,.015],[.6,.3,.27,0,.01],[.74,.23,.21],[.85,.13,.12]],bottom:!0,color:h=>h.y<.34?n:e}),s.loft({st:[[.09,.5,.45,0,-.12],[.4,.41,.37,0,-.07],[.72,.27,.25,0,-.02]],smooth:!1,n:2.3,arc:[os+1.2,os+vs-1.2],hem:{teeth:6,depth:.26,seed:4},pleat:as(7,.16,.2,1.2),color:r,size:.018,along:"v"}),s.loft({st:[[.6,.41,.36,0,-.02],[.73,.31,.28,0,-.01],[.85,.15,.14]],smooth:!1,n:2.4,hem:{teeth:7,depth:.14,seed:2},pleat:as(7,.1,.3),color:o,size:.016}),s.loft({st:[[.44,.324,.294,0,.015],[.49,.32,.29,0,.014]],color:a,size:.012}),s.ellipsoid({c:[0,.465,.315],r:[.044,.048,.02],color:oo,size:.009,density:1.4}),Je(h=>Ks(s,h*.016,.473,.336,.009,.011)),s.tube({pts:[[-.25,.5,.2],[-.1,.64,.27],[.07,.8,.2]],r:[[.022,.009]],color:a,size:.01,cap:!1}),s.loft({c:[-.29,.47,.13],rot:[0,-.9,.1],st:[[-.075,.07,.04],[.06,.078,.046]],n:5,top:!0,bottom:!0,color:"#6b573f",size:.012}),s.sheet({c:[-.318,.5,.166],rot:[0,-.9,.1],pts:[[-.08,.035],[.08,.035],[.07,-.03],[0,-.065],[-.07,-.03]],color:a,size:.009}),s.part(t.head),s.ellipsoid({c:[0,.96,.03],r:[.185,.175,.17],color:i});const c=h=>.175*Math.max(0,1-Math.max(0,(h-.82)/.29)**1.7);s.tube({pts:[[0,.79,-.01],[0,.97,-.02],[.012,1.13,-.07],[.05,1.25,-.2],[.1,1.2,-.37]],r:[[.25,.235],[.268,.252],[.19,.19],[.085,.08],[.004,.004]],n:2.3,cap:!1,color:r,size:.017,grid:[28,48],keep:h=>!(h.z>.04&&h.y>.8&&Math.abs(h.x)<c(h.y))});const l=[];for(let h=0;h<=12;h++){const f=.81+.3*Math.sin(h/12*Math.PI),u=h<6?-1:1,d=h===6?0:u*c(f);l.push([d,f,.215-.05*((f-.81)/.3)**2-Math.abs(d)*.25])}s.tube({pts:l,r:.02,color:o,size:.01,cap:!1,grid:[10,60]}),Je(h=>{Ks(s,h*.066,.975,.2,.015,.03),fe(s,[[h*.025,1.016,.203],[h*.105,1.042,.18]],.008,Ye)}),fe(s,[[-.028,.905,.203],[0,.915,.208],[.028,.905,.203]],.006,Ye),Je(h=>{s.part(h>0?t.armL:t.armR),s.tube({pts:[[h*.27,.72,0],[h*.385,.62,.03],[h*.425,.5,.06]],r:[.046,.04,.036],color:n,size:.014}),Js(s,h,[h*.428,.51,.06],.72,n),h>0&&(fe(s,[[.435,.39,.075],[.44,.345,.08]],.005,Ye),s.frustum({c:[.44,.335,.08],r0:.055,r1:.014,h:.035,color:Xe,size:.01}),s.loft({st:[[.23,.04],[.32,.046]],c:[.44,0,.08],n:3,color:Kh,emissive:1,size:.011,density:2}),s.frustum({c:[.44,.225,.08],r0:.04,r1:.05,h:.018,color:Xe,size:.01,bottom:!0})),s.part(h>0?t.legL:t.legR),s.tube({pts:[[h*.11,.27,0],[h*.11,.12,0]],r:.04,color:Xe,size:.014,cap:!1}),ao(s,h*.11,{k:.88,top:.17,color:"#231b2e"})})}},{name:"Doc Beak",role:"plague doctor",color:"#8d7fb3",rig:{body:{c:[0,.68,0],r:[.27,.34,.24]},head:{c:[0,1.2,0],r:.19},neck:[0,1.03,0],shoulder:[.26,.95,0],hand:[.4,.5,.04],armR:.08,hip:[.12,.34,0],legR:.1},paint(s,t){const e="#2e2839",n="#3d2e52",i="#4a3a64",r="#cfcad6",o="#2a2433";s.part(t.body),s.loft({st:[[.29,.39,.345],[.62,.268,.232],[.9,.212,.186],[1.01,.12,.11]],smooth:!1,n:2.8,arc:[os+.07,os+vs-.07],hem:{teeth:9,depth:.08,seed:5},pleat:as(8,.13,.5,2),color:e,size:.018,along:"v"}),s.ellipsoid({c:[0,.36,0],r:[.3,.04,.26],color:"#15101c",size:.03}),s.loft({st:[[.6,.276,.24],[.636,.27,.234]],n:2.8,color:"#b08a55",size:.01}),Da(s,[0,.618,.245],.04),s.loft({c:[.17,.5,.262],rot:[0,.45,0],st:[[-.06,.046,.03],[.06,.05,.034]],n:4,top:!0,bottom:!0,color:"#c9822f",size:.011}),fe(s,[[.15,.6,.262],[.17,.565,.272]],.006,"#b08a55"),s.loft({st:[[.78,.43,.35],[.9,.33,.28],[1.03,.15,.14]],smooth:!1,n:2.5,hem:{teeth:8,depth:.1,seed:7},pleat:as(8,.09,0),color:n,size:.017}),s.loft({st:[[.92,.27,.235],[1.05,.14,.13]],smooth:!1,n:2.5,hem:{teeth:4,depth:.1,seed:9},color:i,size:.015}),s.part(t.head),s.loft({st:[[.97,.245,.225,0,-.03],[1.16,.236,.226,0,-.03],[1.34,.2,.19,0,-.02]],smooth:!1,n:2.3,arc:[os+.9,os+vs-.9],hem:{teeth:10,depth:.16,seed:11},pleat:as(10,.08,.3,1),color:o,size:.015,along:"v"}),s.ellipsoid({c:[0,1.2,.01],r:[.188,.182,.18],color:r}),Je(a=>{s.ellipsoid({c:[a*.082,1.22,.168],r:[.06,.07,.02],color:"#15101c",size:.01,density:1.5,flat:!0}),Jh(s,a*.064,1.243,.19,.011)}),s.tube({pts:[[0,1.175,.17],[0,1.172,.265],[0,1.14,.335],[0,1.09,.36]],r:[[.05,.046],[.04,.037],[.025,.023],[.004,.004]],color:"#3d2c52",size:.011}),s.ellipsoid({c:[.09,1.13,.168],r:[.013,.024,.01],color:"#d98a2f",size:.006,density:2,flat:!0}),fe(s,[[-.02,1.075,.174],[0,1.082,.178],[.02,1.075,.174]],.005,Ye),Na(s,{c:[0,1.345,0],rot:[.04,0,-.05],brim:[.4,.37],curl:.035,wobble:.02,color:Zh,band:"#8d7fb3",n:2.6,crown:[[0,.2,.186],[.1,.19,.176],[.2,.172,.162]]}),Da(s,[.002,1.385,.2],.036,[.04,0,-.05]),Je(a=>{s.part(a>0?t.armL:t.armR),s.tube({pts:[[a*.26,.95,0],[a*.335,.8,.01],[a*.388,.65,.03]],r:[.07,.092,.118],n:2.5,color:e,size:.016,cap:"flat"}),s.tube({pts:[[a*.382,.672,.03],[a*.398,.59,.035]],r:.128,n:2.6,color:n,size:.014,cap:"flat"}),Js(s,a,[a*.4,.61,.035],1.15,r),a<0&&(s.tube({pts:[[-.43,.19,.15],[-.4,1.24,.06]],r:.018,color:"#7a5236",size:.011}),s.sheet({c:[-.396,1.22,.06],rot:[.08,0,-.03],pts:[[-.035,0],[.035,0],[.1,.05],[.105,.16],[.06,.27],[0,.33],[-.06,.27],[-.105,.16],[-.1,.05]],bend:c=>c*c*2.2,color:c=>c.x>.01&&c.y>.14&&c.y<.26?"#a8652f":"#8d8f9c",size:.013})),s.part(a>0?t.legL:t.legR),s.tube({pts:[[a*.12,.36,0],[a*.12,.2,0]],r:.06,color:"#1f1a28",size:.015,cap:!1}),ao(s,a*.12,{k:1.3,top:.22,color:"#b9b4c2",cuff:n}),s.box({c:[a*.12,.165,.12],h:[.036,.024,.01],rot:[-.5,0,0],color:bi,size:.009})})}}],K1={body:0,head:1,armL:2,armR:3,legL:4,legR:5},tu=1,eu=2,fn=s=>new U(s[0],s[1],s[2]);class J1{constructor(t,e,n,i,r,o,a){Object.assign(this,{def:t,index:e,cloud:n,world:i,mat:r,home:o.clone(),yaw:a}),this.base=e*6;const c=t.rig,l=f=>[-f[0],f[1],f[2]],h=(f,u)=>fn(f).add(fn(u)).multiplyScalar(.5);this.rest=[fn(c.body.c),fn(c.head.c),h(c.shoulder,c.hand),h(l(c.shoulder),l(c.hand)),new U(c.hip[0],c.hip[1]/2,0),new U(-c.hip[0],c.hip[1]/2,0)],this.pivot=[null,fn(c.neck),fn(c.shoulder),fn(l(c.shoulder)),fn(c.hip),fn(l(c.hip))],this.pos=this.rest.map(()=>new U),this.quat=this.rest.map(()=>new sn),this.state="anim",this.t=0,this.phase=e*1.7,this.bodies=null,this.from=null}pose(t,e,n,i=this.pos,r=this.quat){const o=t*6.2*(.9+this.index%3*.08)+this.phase,a=Math.sin(o),c=Math.sin(t*1.6+this.phase),l=Q1.compose(this.home,eM.setFromEuler(co.set(0,this.yaw+n,0)),nu),h=this.rest[0];co.set(.05*e+c*.012,0,a*.07*e+Math.sin(t*.9+this.phase)*.02*(1-e));const f=tM.copy(l).multiply(Qs.makeTranslation(h.x,h.y+Math.abs(a)*.035*e+c*.006,h.z)).multiply(su.makeRotationFromEuler(co)).multiply(Qs.makeTranslation(-h.x,-h.y,-h.z)),u=[null,[-.05*e+Math.sin(t*1.1+this.phase)*.05,Math.sin(t*.7+this.phase*2)*.22*(1-e*.6),-a*.06*e+Math.sin(t*.8+this.phase)*.05],[-a*.6*e+c*.04,0,.1+c*.03],[a*.6*e-c*.04,0,-.1-c*.03],[a*.65*e,0,0],[-a*.65*e,0,0]];this._frame(f,0,i,r);for(let d=1;d<6;d++){const m=this.pivot[d];iu.copy(f).multiply(Qs.makeTranslation(m.x,m.y,m.z)).multiply(su.makeRotationFromEuler(co.set(...u[d]))).multiply(Qs.makeTranslation(-m.x,-m.y,-m.z)),this._frame(iu,d,i,r)}}_frame(t,e,n,i){n[e].copy(this.rest[e]).applyMatrix4(t),i[e].setFromRotationMatrix(t)}flop(t){if(this.state==="rag")return;const e=this.def.rig,n=16<<this.index,i=496&~n,r=(h,f,u,d)=>{const m=new Et({mass:f,material:this.mat,linearDamping:.06,angularDamping:.4,collisionFilterGroup:u?eu:n,collisionFilterMask:u?tu|i:tu|496|eu});return d(m),m.position.copy(this.pos[h]),m.quaternion.copy(this.quat[h]),m.sleepSpeedLimit=.2,m.sleepTimeLimit=1,this.world.addBody(m),m},o=Math.min(e.body.r[0],e.body.r[2])*.95,a=e.body.r[1]-o,c=fn(e.shoulder).distanceTo(fn(e.hand)),l=e.hip[1]/2;this.bodies=[r(0,12,!1,h=>{for(const f of a>.04?[-a,a]:[0])h.addShape(new wh(o),new E(0,f,0))}),r(1,4,!1,h=>h.addShape(new wh(e.head.r*.97))),...[2,3].map(h=>r(h,1.5,!0,f=>f.addShape(new bs(new E(e.armR,c/2,e.armR))))),...[4,5].map(h=>r(h,2.2,!0,f=>f.addShape(new bs(new E(e.legR,l,e.legR*1.25)))))],this.joints=[];for(let h=1;h<6;h++){const f=this.pivot[h],u=h===1,d=new E(0,u?1:-1,0),m=new gx(this.bodies[0],this.bodies[h],{pivotA:new E().copy(ru.copy(f).sub(this.rest[0])),pivotB:new E().copy(ru.copy(f).sub(this.rest[h])),axisA:d,axisB:d.clone(),angle:u?.5:h<4?1.35:.9,twistAngle:.4,collideConnected:!1});this.world.addConstraint(m),this.joints.push(m)}for(const h of this.bodies)h.velocity.set(t.x,t.y,t.z);this.bodies[0].angularVelocity.set((Math.random()-.5)*5,(Math.random()-.5)*3,(Math.random()-.5)*5),this.state="rag",this.t=0}rise(){if(this.state==="rag"){this.from={pos:this.pos.map(t=>t.clone()),quat:this.quat.map(t=>t.clone())};for(const t of this.joints)this.world.removeConstraint(t);for(const t of this.bodies)this.world.removeBody(t);this.bodies=this.joints=null,this.state="rise",this.t=0}}update(t,e,n,i){if(this.t+=t,this.state==="rag"){for(let r=0;r<6;r++)this.pos[r].copy(this.bodies[r].position),this.quat[r].copy(this.bodies[r].quaternion);this.t>5.5&&this.rise()}else if(this.state==="rise"){const r=Math.min(1,this.t/.75),o=r*r*(3-2*r);this.pose(e,n,i,ou,au);for(let a=0;a<6;a++)this.pos[a].lerpVectors(this.from.pos[a],ou[a],o).y+=Math.sin(r*Math.PI)*.22,this.quat[a].slerpQuaternions(this.from.quat[a],au[a],o);r>=1&&(this.state="anim")}else this.pose(e,n,i);for(let r=0;r<6;r++){const o=this.rest[r];this.cloud.parts[this.base+r].compose(this.pos[r],this.quat[r],nu).multiply(Qs.makeTranslation(-o.x,-o.y,-o.z))}}get center(){return this.pos[0]}}const nu=new U(1,1,1),Q1=new Zt,tM=new Zt,iu=new Zt,Qs=new Zt,su=new Zt,eM=new sn,co=new rn,ru=new U,ou=Array.from({length:6},()=>new U),au=Array.from({length:6},()=>new sn),Tn=s=>document.getElementById(s),Cn=.16,As=.14,dr=.56,Oo=1.32,gf=[[-3.45,1.95,1.05],[3.45,1.95,1.05]],fi=new Av({antialias:!1});fi.setPixelRatio(Math.min(devicePixelRatio,pf()?1.5:2));fi.setSize(innerWidth,innerHeight);fi.outputColorSpace=Ue;document.body.prepend(fi.domElement);const vf=new U1(fi,pf()?"low":"high"),Ve=new Cv,_f=new zt("#2a2344");Ve.fog=new kc(_f,.0145);const Fe=new tn(38,innerWidth/innerHeight,.1,1200),Rc=c1(_f);Ve.add(Rc);const nM=b1(Ve),iM=new ce(new Hc(46,48).rotateX(-Math.PI/2),Ii("#2a3336",{mottle:.7,rim:0}));Ve.add(iM);Ve.add(us(sr.BOX,Ii(ci.wood,{color2:ci.plumDark,stripes:2.4,axis:2,mottle:.5}),{pos:[0,Cn/2,.1],scale:[7.6,Cn,2.7],outline:.025}));Fs.forEach((s,t)=>{Ve.add(us(sr.CYL,Ii(ci.stone,{gradColor:ci.stoneDark,gradY:[-.07,.05],mottle:.5}),{pos:[(t-2)*Oo,Cn+As/2,0],scale:[dr,As,dr],outline:.018}))});const xf=[];for(const[s,t,e]of gf){Ve.add(us(sr.CYL,Ii(ci.coal),{pos:[s,t/2-.1,e],scale:[.035,t-.2,.035],outline:.012})),Ve.add(us(sr.CYL,Ii(ci.coal),{pos:[s,.05,e],scale:[.14,.1,.14],outline:.012})),Ve.add(us(sr.BOX,Ii(ci.amber,{emissive:1}),{pos:[s,t,e],scale:[.2,.26,.2],outline:.014})),Ve.add(us(new lr(.2,.16,4),Ii(ci.coal),{pos:[s,t+.21,e],rot:[0,Math.PI/4,0],outline:.012}));const n=new ce(new Ns(2.4,2.4),r1("#ffb860",.8));n.position.set(s,t,e),Ve.add(n),xf.push(n)}const zs=new Oy({gravity:new E(0,-12,0)});zs.allowSleep=!0;zs.solver.iterations=14;const bo=new vr("puppet");zs.addContactMaterial(new gr(bo,bo,{friction:.5,restitution:.08}));const Zc=(s,t,e,n)=>{const i=new Et({mass:0,material:bo,collisionFilterGroup:1,collisionFilterMask:-1});return i.addShape(s),i.position.set(t,e,n),zs.addBody(i),i};Zc(new yx,0,0,0).quaternion.setFromEuler(-Math.PI/2,0,0);Zc(new bs(new E(3.8,Cn/2,1.35)),0,Cn/2,.1);Fs.forEach((s,t)=>Zc(new xx(dr,dr,As,16),(t-2)*Oo,Cn+As/2,0));const nn=new O1(Fs.length*6),yf=[];Fs.forEach((s,t)=>{const e=nn.n,n=t*6;s.paint(new G1(nn,Sn(101+t*17)),Object.fromEntries(Object.entries(K1).map(([i,r])=>[i,n+r]))),yf.push(nn.n-e)});Ve.add(nn.build());nn.material.uniforms.uLampPos.value.forEach((s,t)=>s.set(...gf[t]));const di=Fs.map((s,t)=>new J1(s,t,nn,zs,bo,new U((t-2)*Oo,Cn+As,0),(2-t)*.12)),sM=new Ie({uniforms:{uOpacity:{value:.6}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform float uOpacity; varying vec2 vUv;
    void main(){ float r = length(vUv); gl_FragColor = vec4(0.027, 0.016, 0.05, pow(1.0 - smoothstep(0.0, 1.0, r), 1.7) * uOpacity); }`,transparent:!0,depthWrite:!1}),cu=di.map(()=>{const s=new ce(new Ns(1,1).rotateX(-Math.PI/2),sM);return s.renderOrder=1,Ve.add(s),s}),rM=(s,t)=>{for(let e=0;e<di.length;e++)if(Math.hypot(s-(e-2)*Oo,t)<dr)return Cn+As;return Math.abs(s)<3.8&&Math.abs(t-.1)<1.35?Cn:0},Te={yaw:0,pitch:.1,dist:1,target:new U(0,.98,0)},oM=()=>Math.max(7.6,4.35/(Math.tan(Fe.fov*Math.PI/360)*Fe.aspect));function aM(){const s=oM()*Te.dist,t=Math.cos(Te.pitch);Fe.position.set(Te.target.x+Math.sin(Te.yaw)*t*s,Te.target.y+Math.sin(Te.pitch)*s,Te.target.z+Math.cos(Te.yaw)*t*s),Fe.lookAt(Te.target)}const Cs=fi.domElement,li=new Map;let To=0,yo=0;Cs.addEventListener("pointerdown",s=>{Cs.setPointerCapture(s.pointerId),li.set(s.pointerId,[s.clientX,s.clientY]),li.size===1&&(To=0)});Cs.addEventListener("pointermove",s=>{const t=li.get(s.pointerId);if(!t)return;const e=s.clientX-t[0],n=s.clientY-t[1];if(li.set(s.pointerId,[s.clientX,s.clientY]),li.size===2){const[i,r]=[...li.values()],o=Math.hypot(i[0]-r[0],i[1]-r[1]);yo&&(Te.dist=Math.max(.35,Math.min(1.6,Te.dist*yo/o))),yo=o,To=99;return}To+=Math.abs(e)+Math.abs(n),Te.yaw-=e*.006,Te.pitch=Math.max(-.05,Math.min(1.1,Te.pitch+n*.005))});const Mf=s=>{li.delete(s.pointerId)&&li.size===0&&To<6&&s.type==="pointerup"&&cM(s.clientX,s.clientY),yo=0};Cs.addEventListener("pointerup",Mf);Cs.addEventListener("pointercancel",Mf);Cs.addEventListener("wheel",s=>{s.preventDefault(),Te.dist=Math.max(.35,Math.min(1.6,Te.dist*Math.exp(s.deltaY*.001)))},{passive:!1});const Fa=new h_,lu=new U,hu=new Ro;function cM(s,t){Fa.setFromCamera(new ct(s/innerWidth*2-1,-(t/innerHeight)*2+1),Fe);let e=null,n=1/0;for(const i of di)if(hu.set(i.center,.55),Fa.ray.intersectSphere(hu,lu)){const r=lu.distanceTo(Fe.position);r<n&&(n=r,e=i)}e&&(e.state==="rag"?e.rise():e.flop(Kc(Fa.ray.direction)))}const Kc=s=>new U(s.x*1.5+(Math.random()-.5)*.6,2.3+Math.random()*.8,s.z*1.5+(Math.random()-.5)*.6),Qe={walk:!0,turn:!1,walkK:1,turnA:0};Tn("drop").onclick=()=>di.forEach((s,t)=>setTimeout(()=>s.flop(Kc(new U(Math.random()-.5,0,Math.random()-.3))),t*130));Tn("up").onclick=()=>di.forEach(s=>s.rise());const Sf=(s,t)=>{Tn(s).onclick=()=>{Qe[t]=!Qe[t],Tn(s).setAttribute("aria-pressed",Qe[t])},Tn(s).setAttribute("aria-pressed",Qe[t])};Sf("walk","walk");Sf("turn","turn");Tn("size").oninput=s=>{nn.material.uniforms.uSize.value=+s.target.value};Tn("soft").oninput=s=>{nn.material.uniforms.uSharp.value=+s.target.value};Tn("stats").textContent=`${nn.n.toLocaleString("en-US")} splats · 6 parts and 5 joints per puppet`;const uu=Fs.map((s,t)=>{const e=document.createElement("div");return e.className="tag",e.style.setProperty("--c",s.color),e.innerHTML=`<b>${s.name}</b><span>${s.role} · ${(yf[t]/1e3).toFixed(1)}k</span>`,Tn("labels").appendChild(e),e});addEventListener("resize",()=>{Fe.aspect=innerWidth/innerHeight,Fe.updateProjectionMatrix(),fi.setSize(innerWidth,innerHeight)});let Pc=performance.now(),or=0,lo=0;const lM=Tn("fps"),cs={n:0,t0:Pc},fu=new ct,ho=new U;function Ef(s){for(or+=s,lo=Math.min(lo+s,4/60);lo>=1/60;)zs.step(1/60),lo-=1/60;Qe.walkK+=((Qe.walk?1:0)-Qe.walkK)*Math.min(1,s*5),Qe.turn&&(Qe.turnA+=s*.7);for(const t of di)t.update(s,or,Qe.walkK,Qe.turnA)}function wf(s){const t=Math.min(.05,(s-Pc)/1e3);Pc=s,Ef(t),aM(),Fe.updateMatrixWorld(),di.forEach((e,n)=>{const i=e.center,r=rM(i.x,i.z),o=.95+Math.max(0,i.y-r-.5)*.5;cu[n].position.set(i.x,r+.012,i.z),cu[n].scale.set(o,1,o),ho.set(e.home.x,Cn,1.42).project(Fe),uu[n].style.transform=`translate(-50%, 0) translate(${((ho.x*.5+.5)*innerWidth).toFixed(1)}px, ${((-ho.y*.5+.5)*innerHeight).toFixed(1)}px)`,uu[n].style.display=ho.z<1?"":"none"}),fi.getDrawingBufferSize(fu),nn.material.uniforms.uViewport.value.copy(fu),nn.sort(Fe);for(const e of xf)e.quaternion.copy(Fe.quaternion);Rc.position.copy(Fe.position),Rc.material.uniforms.uTime.value=or,nM.update(or,t),vf.render(Ve,Fe,or),cs.n++,s-cs.t0>=1e3&&(lM.textContent=`${Math.round(cs.n*1e3/(s-cs.t0))} fps`,cs.n=0,cs.t0=s),requestAnimationFrame(wf)}requestAnimationFrame(wf);window.__show={puppets:di,cloud:nn,view:Te,ui:Qe,camera:Fe,post:vf,tick:Ef,shove:Kc};
