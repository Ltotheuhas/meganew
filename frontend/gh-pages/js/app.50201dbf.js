(function(){"use strict";var e={8953:function(e,t,o){var n=o(3751),a=o(641);const i={id:"app"};function r(e,t,o,n,r,s){const c=(0,a.g2)("WhiteCubeRoom");return(0,a.uX)(),(0,a.CE)("div",i,[(0,a.bF)(c)])}function s(e,t,o,n,i,r){const s=(0,a.g2)("ThreeJSScene"),c=(0,a.g2)("UploadMenu");return(0,a.uX)(),(0,a.CE)("div",null,[(0,a.bF)(s,{ref:"threeScene"},null,512),e.isMobile?((0,a.uX)(),(0,a.CE)("button",{key:0,onClick:t[0]||(t[0]=(...e)=>r.toggleUploadMenu&&r.toggleUploadMenu(...e))},"Upload Files")):(0,a.Q3)("",!0),i.showUploadMenu?((0,a.uX)(),(0,a.Wv)(c,{key:1,onUpload:r.handleUpload},null,8,["onUpload"])):(0,a.Q3)("",!0)])}o(4603),o(7566),o(8721);const c={ref:"threeContainer",class:"three-container"};function d(e,t,o,n,i,r){return(0,a.uX)(),(0,a.CE)("div",c,null,512)}o(4114),o(6573),o(8100),o(7936),o(7467),o(4732),o(9577),o(4979);var l=o(9437),h=o(9318),u=o(2763),p=o(7070),w=o(3487),m=o(9702),f=o(6998),g=o(9502),b=o(5048),y=o(712),v=o(2393),k=o(33);const L=e=>((0,a.Qi)("data-v-d76b36f0"),e=e(),(0,a.jt)(),e),E={class:"info-log"},j={class:"status"},U={key:0},F=L((()=>(0,a.Lk)("h2",null,"Todo",-1))),C={key:1},I=L((()=>(0,a.Lk)("p",null,"Press B to upload a file",-1))),A=L((()=>(0,a.Lk)("p",null,"Press C to clear all objects",-1))),S=L((()=>(0,a.Lk)("p",null,"Use WASD or arrow keys to move around",-1))),O=L((()=>(0,a.Lk)("p",null,"Phone controls may or may not work rn",-1))),x=L((()=>(0,a.Lk)("p",null,"Currently supports image files and obj files",-1))),T=L((()=>(0,a.Lk)("p",null,"EVEN GIFS WORK WHICH WAS WAY MORE FUCKING WORK THAN EXPECTED",-1))),B=L((()=>(0,a.Lk)("p",null,"Objects SHOULD BE saved to local storage so they reappear even when refreshed",-1))),D=L((()=>(0,a.Lk)("p",null,"But thats broken rn",-1))),M=[I,A,S,O,x,T,B,D];function R(e,t,o,n,i,r){return(0,a.uX)(),(0,a.CE)("div",E,[(0,a.Lk)("h1",j,(0,k.v_)(i.backendStatus),1),i.isLocalhost?((0,a.uX)(),(0,a.CE)("div",U,[F,((0,a.uX)(!0),(0,a.CE)(a.FK,null,(0,a.pI)(i.todoList,((e,t)=>((0,a.uX)(),(0,a.CE)("p",{key:t},(0,k.v_)(e),1)))),128))])):((0,a.uX)(),(0,a.CE)("div",C,M))])}var $={data(){return{isLocalhost:!1,backendStatus:"Checking...",todoList:["idk"]}},mounted(){this.isLocalhost="localhost"===window.location.hostname,this.checkBackendStatus()},methods:{async checkBackendStatus(){try{console.log("Checking backend status...");const e=await fetch("http://localhost:3000/health");console.log("Response:",e),e.ok?(console.log("Backend is online"),this.backendStatus="ONLINE"):(console.log("Backend is offline"),this.backendStatus="OFFLINE")}catch(e){console.error("Error checking backend status:",e),this.backendStatus="OFFLINE"}}}},P=o(6262);const K=(0,P.A)($,[["render",R],["__scopeId","data-v-d76b36f0"]]);var X=K,W=o(354),_=o.n(W),q={name:"ThreeJSScene",data(){return{move:{forward:!1,backward:!1,left:!1,right:!1},touchStart:{x:0,y:0},objects:[],canvas:document.createElement("canvas"),ctx:null,frames:[],frameIndex:0,playing:!0,infoLogComponent:null,infoLogContainer:null,infoLogTexture:null}},mounted(){this.initThreeJS(),this.loadObjectsFromBackend(),this.setupPeriodicUpdate()},methods:{async initThreeJS(){const e=this.$refs.threeContainer,t=new l.Z58,i=new l.ubm(75,window.innerWidth/window.innerHeight,.1,1e3);i.rotation.order="YXZ";const r=new l.JeP;r.setSize(window.innerWidth,window.innerHeight),e.appendChild(r.domElement);const s=new l.$p8(16777215);t.add(s);const c=new l.fTw(20,20);t.add(c);const d=new l.IzY(5);t.add(d);const u=new l.iNn(100,100,100),p=new l.V9B({color:16777215,side:l.hsX}),w=new l.eaF(u,p);t.add(w);const m=new l.Tap;m.load(o(852),(e=>{const o=e.image.width/e.image.height,n=4,a=n/o,s=new l.bdM(n,a),c=new l.V9B({map:e,transparent:!0,side:l.$EB}),d=new l.eaF(s,c);d.position.set(0,4,0),t.add(d);const h=()=>{requestAnimationFrame(h),this.move.forward&&f.moveForward(.1),this.move.backward&&f.moveForward(-.1),this.move.left&&f.moveRight(-.1),this.move.right&&f.moveRight(.1),d.rotation.y+=.01,r.render(t,i)};h()}));const f=new h.Z(i,r.domElement);this.controls=f;const g=()=>{console.error("Pointer lock error occurred.")};document.addEventListener("pointerlockerror",g),document.addEventListener("click",(()=>{this.$parent.showUploadMenu||f.lock()}));const b=this.move,y=e=>{switch(e.code){case"ArrowUp":case"KeyW":b.forward=!0;break;case"ArrowDown":case"KeyS":b.backward=!0;break;case"ArrowLeft":case"KeyA":b.left=!0;break;case"ArrowRight":case"KeyD":b.right=!0;break}},v=e=>{switch(e.code){case"ArrowUp":case"KeyW":b.forward=!1;break;case"ArrowDown":case"KeyS":b.backward=!1;break;case"ArrowLeft":case"KeyA":b.left=!1;break;case"ArrowRight":case"KeyD":b.right=!1;break}};document.addEventListener("keydown",y),document.addEventListener("keyup",v);const k=e=>{this.touchStart.x=e.touches[0].clientX,this.touchStart.y=e.touches[0].clientY},L=e=>{const t=e.touches[0].clientX-this.touchStart.x,o=e.touches[0].clientY-this.touchStart.y;i.rotation.y-=.002*t,i.rotation.x-=.002*o,i.rotation.x=Math.max(-Math.PI/2,Math.min(Math.PI/2,i.rotation.x)),this.touchStart.x=e.touches[0].clientX,this.touchStart.y=e.touches[0].clientY};document.addEventListener("touchstart",k),document.addEventListener("touchmove",L);const E=()=>{requestAnimationFrame(E),this.move.forward&&f.moveForward(.1),this.move.backward&&f.moveForward(-.1),this.move.left&&f.moveRight(-.1),this.move.right&&f.moveRight(.1),r.render(t,i)};E(),window.addEventListener("resize",(()=>{i.aspect=window.innerWidth/window.innerHeight,i.updateProjectionMatrix(),r.setSize(window.innerWidth,window.innerHeight)})),i.position.set(0,2,5),this.infoLogComponent=(0,n.Ef)(X),this.infoLogContainer=document.createElement("div"),document.body.appendChild(this.infoLogContainer),this.infoLogComponent.mount(this.infoLogContainer),await(0,a.dY)();const j=await this.createInfoLogCanvas();this.infoLogTexture=new l.GOR(j);const U=j.width/j.height,F=new l.bdM(16,16/U),C=new l.V9B({map:this.infoLogTexture,transparent:!0}),I=new l.eaF(F,C);I.position.set(0,2,0),t.add(I),this.scene=t,this.camera=i,this.renderer=r},async createInfoLogCanvas(){if(!this.infoLogContainer)throw new Error("infoLogContainer is not defined");return await _()(this.infoLogContainer,{backgroundColor:null,scale:2,ignoreElements:e=>"CANVAS"===e.tagName&&e.hasAttribute("data-engine")})},async updateInfoLogTexture(){const e=await this.createInfoLogCanvas();this.infoLogTexture.image=e,this.infoLogTexture.needsUpdate=!0},setupPeriodicUpdate(){setInterval(this.updateInfoLogTexture,5e3)},async saveObjectsToBackend(){try{const e=await fetch("http://localhost:3000/objects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.objects)});if(!e.ok)throw new Error("Failed to save objects to backend");console.log("Objects saved to backend successfully")}catch(e){console.error("Error saving objects to backend:",e)}},async loadObjectsFromBackend(){try{const e=await fetch("http://localhost:3000/objects");if(!e.ok)throw new Error("Failed to load objects from backend");const t=await e.json();this.objects=t,this.objects.forEach((e=>{switch(e.type){case"image":this.loadImageFromData(e);break;case"audio":this.loadAudioFromData(e);break;case"model":this.loadModelFromData(e);break;default:console.warn("Unknown object type:",e.type)}}))}catch(e){console.error("Error loading objects from backend:",e)}},loadObject(e){switch(e.type){case"image":this.loadImageFromData(e);break;case"audio":this.loadAudioFromData(e);break;case"model":this.loadModelFromData(e);break;default:console.warn("Unknown object type:",e.type)}},async getFileTypeFromBlobUrl(e){const t=await fetch(e),o=await t.blob();return o.type.split("/")[1]},async addImage(e){console.log(`addImage called with URL: ${e}`);const t=await this.getFileTypeFromBlobUrl(e);console.log(`Detected file type: ${t}`);const o=new l.Tap;if("gif"===t){console.log(`Detected GIF file, proceeding to load GIF: ${e}`);const t=await this.blobToBase64(e),o=await this.loadGIF(t,this.scene);this.objects.push({type:"image",base64:t,position:o.position.clone(),rotation:o.rotation.clone(),uuid:o.uuid}),await this.saveObjectsToBackend()}else console.log(`Loading non-GIF image from URL: ${e}`),o.load(e,(async t=>{const o=t.image.width/t.image.height,n=new l.bdM(2,2/o),a=new l.V9B({map:t,side:l.$EB}),i=new l.eaF(n,a),r=5,s=new l.Pq0(0,0,-r);s.applyQuaternion(this.camera.quaternion),i.position.copy(this.camera.position).add(s),i.lookAt(this.camera.position),this.scene.add(i),this.objects.push({type:"image",url:e,position:i.position.clone(),rotation:i.rotation.clone(),uuid:i.uuid}),await this.saveObjectsToBackend()}))},async blobToBase64(e){const t=await fetch(e),o=await t.blob();return new Promise(((e,t)=>{const n=new FileReader;n.onloadend=()=>e(n.result),n.onerror=t,n.readAsDataURL(o)}))},loadImageFromData(e){const t=new l.Tap;console.log("Loading image from data:",e),e.base64?this.loadGIF(e.base64,this.scene,e.position,e.rotation):e.url?t.load(e.url,(t=>{const o=t.image.width/t.image.height,n=new l.bdM(2,2/o),a=new l.V9B({map:t,side:l.$EB}),i=new l.eaF(n,a);i.position.copy(e.position),i.rotation.copy(e.rotation),this.scene.add(i)}),void 0,(e=>{console.error("Error loading texture:",e)})):console.error("No URL or base64 data found for image:",e)},async loadGIF(e,t,o=null,n=null){const a=this.base64ToArrayBuffer(e),i=(0,v.O5)(a),r=(0,v.Ud)(i,!0),s=document.createElement("canvas");s.width=r[0].dims.width,s.height=r[0].dims.height;const c=s.getContext("2d"),d=new l.GOR(s),h=s.width/s.height,u=new l.bdM(2,2/h),p=new l.V9B({map:d,side:l.$EB}),w=new l.eaF(u,p);if(console.log("Initial plane position:",w.position),console.log("Initial plane rotation:",w.rotation),o)w.position.copy(o),console.log("Loaded position:",o);else{const e=5,t=new l.Pq0(0,0,-e);t.applyQuaternion(this.camera.quaternion),w.position.copy(this.camera.position).add(t),console.log("Calculated position in front of camera:",w.position)}n?(w.rotation.copy(n),console.log("Loaded rotation:",n)):(w.lookAt(this.camera.position),console.log("Calculated rotation to face camera:",w.rotation)),t.add(w);let m=0;const f=()=>{requestAnimationFrame(f);const e=r[m];c.putImageData(new ImageData(new Uint8ClampedArray(e.patch),e.dims.width,e.dims.height),e.dims.left,e.dims.top),d.needsUpdate=!0,m=(m+1)%r.length};return f(),this.objects.push({type:"image",base64:e,position:w.position.clone(),rotation:w.rotation.clone(),uuid:w.uuid}),await this.saveObjectsToBackend(),w},base64ToArrayBuffer(e){const t=window.atob(e.split(",")[1]),o=t.length,n=new Uint8Array(o);for(let a=0;a<o;a++)n[a]=t.charCodeAt(a);return n.buffer},renderFrame(){const e=this.frames[this.frameIndex],{dims:t,patch:o}=e;this.ctx.putImageData(new ImageData(new Uint8ClampedArray(o),t.width,t.height),t.left,t.top),this.frameIndex=(this.frameIndex+1)%this.frames.length},async addAudio(e){const t=new Audio(e),o=new l.iNn(.5,.5,.5),n=new l.V9B({color:65280}),a=new l.eaF(o,n),i=5,r=new l.Pq0(0,0,-i);r.applyQuaternion(this.camera.quaternion),a.position.copy(this.camera.position).add(r),a.userData={onClick:()=>t.play()},this.scene.add(a),this.objects.push({type:"audio",url:e,position:a.position.clone(),uuid:a.uuid}),await this.saveObjectsToBackend()},getLoader(e){switch(e){case"gltf":case"glb":return new u.B;case"obj":return new p.L;case"fbx":return new w.w;case"stl":return new m.t;case"dae":return new f.q;case"3ds":return new g.b;case"ply":return new b.Z;case"wrl":return new y.F;default:return console.error("Unsupported model file type"),null}},async addModel(e,t){const o=this.getLoader(t);if(!o)return;const n=await fetch(e),a=await n.blob(),i=new FileReader;i.readAsDataURL(a),i.onloadend=async()=>{const e=i.result,o={type:"model",extension:t,data:e,position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0,order:"XYZ"},uuid:l.cj9.generateUUID()},n=await this.loadModelFromData(o),a=5,r=new l.Pq0(0,0,-a);r.applyQuaternion(this.camera.quaternion),n.position.copy(this.camera.position).add(r),n.position.y=0;const s=new l.Pq0;this.camera.getWorldDirection(s),s.y=0,s.normalize();const c=n.position.clone().add(s);n.lookAt(c),n.rotation.x=0,n.rotation.z=0,o.position=n.position.clone(),o.rotation=n.rotation.clone(),this.objects.push(o),await this.saveObjectsToBackend()}},async loadModelFromData(e){console.log("Loading model from data:",e);const t=this.getLoader(e.extension);if(!t)return;const o=await fetch(e.data),n=await o.blob(),a=URL.createObjectURL(n);return new Promise((o=>{t.load(a,(t=>{let n;n=t.scene?t.scene:t,n.position.set(e.position.x,e.position.y,e.position.z),n.rotation.set(e.rotation._x,e.rotation._y,e.rotation._z,e.rotation._order),n.uuid=e.uuid,this.scene.add(n),o(n)}))}))},clearObjects(){console.log("Clearing all objects from the scene and local storage."),this.objects.forEach((async e=>{if(e&&e.uuid){const o=this.scene.getObjectByProperty("uuid",e.uuid);o?(this.scene.remove(o),console.log(`Removed object with UUID: ${e.uuid}`),o.geometry&&o.geometry.dispose(),o.material&&(Array.isArray(o.material)?o.material.forEach((e=>e.dispose())):o.material.dispose())):console.warn(`Object with UUID: ${e.uuid} not found in the scene.`);try{const t=await fetch(`http://localhost:3000/objects/${e._id}`,{method:"DELETE"});t.ok?console.log(`Object with ID: ${e._id} removed from database.`):console.error(`Failed to remove object with ID: ${e._id} from database.`)}catch(t){console.error(`Error removing object with ID: ${e._id} from database:`,t)}}else console.warn("Encountered invalid object or object without UUID:",e)})),this.objects=[],console.log("All objects have been cleared.")}},beforeUnmount(){window.removeEventListener("resize",this.checkOrientation),window.removeEventListener("orientationchange",this.checkOrientation),document.removeEventListener("pointerlockerror",this.onPointerLockError),document.removeEventListener("keydown",this.onKeyDown),document.removeEventListener("keyup",this.onKeyUp),document.removeEventListener("touchstart",this.onTouchStart),document.removeEventListener("touchmove",this.onTouchMove),window.removeEventListener("keydown",this.handleKeydown)}};const z=(0,P.A)(q,[["render",d]]);var N=z;const G={class:"upload-menu"};function V(e,t,o,n,i,r){return(0,a.uX)(),(0,a.CE)("div",G,[(0,a.Lk)("input",{type:"file",onChange:t[0]||(t[0]=(...e)=>r.handleFileUpload&&r.handleFileUpload(...e))},null,32)])}var H={methods:{handleFileUpload(e){const t=e.target.files[0];this.$emit("upload",t)}}};const Y=(0,P.A)(H,[["render",V]]);var J=Y,Q={name:"WhiteCubeRoom",components:{ThreeJSScene:N,UploadMenu:J},data(){return{showUploadMenu:!1}},mounted(){window.addEventListener("keydown",this.handleKeydown)},beforeUnmount(){window.removeEventListener("keydown",this.handleKeydown)},methods:{toggleUploadMenu(){this.showUploadMenu=!this.showUploadMenu,this.showUploadMenu?document.exitPointerLock():this.$refs.threeScene.controls&&!1===this.$refs.threeScene.controls.isLocked&&this.$refs.threeScene.controls.lock()},handleKeydown(e){switch(e.key.toLowerCase()){case"b":this.toggleUploadMenu();break;case"c":this.$refs.threeScene.clearObjects();break;default:break}},handleUpload(e){const t=10485760;if(e.size>t)return void alert("File size exceeds the limit of "+t/1024/1024+"MB.");const o=URL.createObjectURL(e),n=e.name.split(".").pop().toLowerCase();switch(n){case"jpg":case"jpeg":case"png":case"gif":this.$refs.threeScene.addImage(o);break;case"mp3":case"wav":this.$refs.threeScene.addAudio(o);break;case"gltf":case"glb":case"obj":case"fbx":case"stl":case"dae":case"3ds":case"ply":case"x3d":case"wrl":this.$refs.threeScene.addModel(o,n);break;default:console.error("Unsupported file type")}this.showUploadMenu=!1,this.$refs.threeScene.controls&&this.$refs.threeScene.controls.lock()}}};const Z=(0,P.A)(Q,[["render",s]]);var ee=Z,te={name:"App",components:{WhiteCubeRoom:ee}};const oe=(0,P.A)(te,[["render",r]]);var ne=oe;(0,n.Ef)(ne).mount("#app")},852:function(e,t,o){e.exports=o.p+"img/megaworld.f0fc96be.png"}},t={};function o(n){var a=t[n];if(void 0!==a)return a.exports;var i=t[n]={exports:{}};return e[n].call(i.exports,i,i.exports,o),i.exports}o.m=e,function(){var e=[];o.O=function(t,n,a,i){if(!n){var r=1/0;for(l=0;l<e.length;l++){n=e[l][0],a=e[l][1],i=e[l][2];for(var s=!0,c=0;c<n.length;c++)(!1&i||r>=i)&&Object.keys(o.O).every((function(e){return o.O[e](n[c])}))?n.splice(c--,1):(s=!1,i<r&&(r=i));if(s){e.splice(l--,1);var d=a();void 0!==d&&(t=d)}}return t}i=i||0;for(var l=e.length;l>0&&e[l-1][2]>i;l--)e[l]=e[l-1];e[l]=[n,a,i]}}(),function(){o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,{a:t}),t}}(),function(){o.d=function(e,t){for(var n in t)o.o(t,n)&&!o.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){o.p="/meganew/"}(),function(){var e={524:0};o.O.j=function(t){return 0===e[t]};var t=function(t,n){var a,i,r=n[0],s=n[1],c=n[2],d=0;if(r.some((function(t){return 0!==e[t]}))){for(a in s)o.o(s,a)&&(o.m[a]=s[a]);if(c)var l=c(o)}for(t&&t(n);d<r.length;d++)i=r[d],o.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return o.O(l)},n=self["webpackChunkmegafrontend"]=self["webpackChunkmegafrontend"]||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))}();var n=o.O(void 0,[504],(function(){return o(8953)}));n=o.O(n)})();
//# sourceMappingURL=app.50201dbf.js.map