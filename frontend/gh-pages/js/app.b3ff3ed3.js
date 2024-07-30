(function(){"use strict";var e={3741:function(e,t,n){var o=n(3751),a=n(641);const r={id:"app"};function i(e,t,n,o,i,s){const c=(0,a.g2)("WhiteCubeRoom");return(0,a.uX)(),(0,a.CE)("div",r,[(0,a.bF)(c)])}function s(e,t,n,o,r,i){const s=(0,a.g2)("ThreeJSScene"),c=(0,a.g2)("UploadMenu");return(0,a.uX)(),(0,a.CE)("div",null,[(0,a.bF)(s,{ref:"threeScene"},null,512),e.isMobile?((0,a.uX)(),(0,a.CE)("button",{key:0,onClick:t[0]||(t[0]=(...e)=>i.toggleUploadMenu&&i.toggleUploadMenu(...e))},"Upload Files")):(0,a.Q3)("",!0),r.showUploadMenu?((0,a.uX)(),(0,a.Wv)(c,{key:1,onUpload:i.handleUpload},null,8,["onUpload"])):(0,a.Q3)("",!0)])}n(4603),n(7566),n(8721);const c={ref:"threeContainer",class:"three-container"};function d(e,t,n,o,r,i){return(0,a.uX)(),(0,a.CE)("div",c,null,512)}var l=n(9437),u=n(9318),w=n(2763),h=n(7070),p=n(3487),m=n(9702),f=n(6998),b=n(9502),y=n(5048),v=n(712),g=n(602);const k="ThreeJSObjectsDB",S=1,j="objects",U="files";async function L(){try{const e=await(0,g.P2)(k,S,{upgrade(e){e.objectStoreNames.contains(j)||e.createObjectStore(j,{keyPath:"uuid"}),e.objectStoreNames.contains(U)||e.createObjectStore(U)}});return console.log("IndexedDB initialized successfully."),e}catch(e){console.error("Error initializing IndexedDB:",e)}}async function E(e){const t=await L(),n=t.transaction(j,"readwrite");await n.objectStore(j).put(e),await n.done}async function F(e,t){const n=await L(),o=n.transaction(U,"readwrite"),a=new FileReader;a.onloadend=async()=>{const t=a.result;await o.objectStore(U).put(t,e),await o.done},a.readAsArrayBuffer(t)}async function A(){const e=await L(),t=e.transaction(j,"readonly"),n=await t.objectStore(j).getAll();return await t.done,n}async function M(e){const t=await L(),n=t.transaction(U,"readonly"),o=await n.objectStore(U).get(e);return await n.done,new Blob([o])}async function O(){const e=await L(),t=e.transaction(j,"readwrite");await t.objectStore(j).clear(),await t.done;const n=e.transaction(U,"readwrite");await n.objectStore(U).clear(),await n.done}var x={name:"ThreeJSScene",data(){return{move:{forward:!1,backward:!1,left:!1,right:!1},touchStart:{x:0,y:0},objects:[]}},async mounted(){await this.initThreeJS(),await this.loadObjects()},methods:{async initThreeJS(){const e=this.$refs.threeContainer,t=new l.Z58,o=new l.ubm(75,window.innerWidth/window.innerHeight,.1,1e3);o.rotation.order="YXZ";const a=new l.JeP;a.setSize(window.innerWidth,window.innerHeight),e.appendChild(a.domElement);const r=new l.$p8(16777215);t.add(r);const i=new l.fTw(20,20);t.add(i);const s=new l.IzY(5);t.add(s);const c=new l.iNn(10,10,10),d=new l.V9B({color:16777215,side:l.hsX}),w=new l.eaF(c,d);t.add(w);const h=new l.Tap;h.load(n(852),(e=>{const n=e.image.width/e.image.height,r=4,i=r/n,s=new l.bdM(r,i),c=new l.V9B({map:e,transparent:!0,side:l.$EB}),d=new l.eaF(s,c);d.position.set(0,2,0),t.add(d);const u=()=>{requestAnimationFrame(u),this.move.forward&&p.moveForward(.1),this.move.backward&&p.moveForward(-.1),this.move.left&&p.moveRight(-.1),this.move.right&&p.moveRight(.1),d.rotation.y+=.01,a.render(t,o)};u()}));const p=new u.Z(o,a.domElement);this.controls=p;const m=()=>{console.error("Pointer lock error occurred.")};document.addEventListener("pointerlockerror",m),document.addEventListener("click",(()=>p.lock()));const f=this.move,b=e=>{switch(e.code){case"ArrowUp":case"KeyW":f.forward=!0;break;case"ArrowDown":case"KeyS":f.backward=!0;break;case"ArrowLeft":case"KeyA":f.left=!0;break;case"ArrowRight":case"KeyD":f.right=!0;break}},y=e=>{switch(e.code){case"ArrowUp":case"KeyW":f.forward=!1;break;case"ArrowDown":case"KeyS":f.backward=!1;break;case"ArrowLeft":case"KeyA":f.left=!1;break;case"ArrowRight":case"KeyD":f.right=!1;break}};document.addEventListener("keydown",b),document.addEventListener("keyup",y);const v=e=>{this.touchStart.x=e.touches[0].clientX,this.touchStart.y=e.touches[0].clientY},g=e=>{const t=e.touches[0].clientX-this.touchStart.x,n=e.touches[0].clientY-this.touchStart.y;o.rotation.y-=.002*t,o.rotation.x-=.002*n,o.rotation.x=Math.max(-Math.PI/2,Math.min(Math.PI/2,o.rotation.x)),this.touchStart.x=e.touches[0].clientX,this.touchStart.y=e.touches[0].clientY};document.addEventListener("touchstart",v),document.addEventListener("touchmove",g);const k=()=>{requestAnimationFrame(k),this.move.forward&&p.moveForward(.1),this.move.backward&&p.moveForward(-.1),this.move.left&&p.moveRight(-.1),this.move.right&&p.moveRight(.1),a.render(t,o)};k(),window.addEventListener("resize",(()=>{o.aspect=window.innerWidth/window.innerHeight,o.updateProjectionMatrix(),a.setSize(window.innerWidth,window.innerHeight)})),o.position.set(0,2,5),this.scene=t,this.camera=o,this.renderer=a},async addImage(e,t){const n=new l.Tap;n.load(e,(async n=>{const o=n.image.width/n.image.height,a=new l.bdM(2,2/o),r=new l.V9B({map:n,side:l.$EB}),i=new l.eaF(a,r),s=5,c=new l.Pq0(0,0,-s);c.applyQuaternion(this.camera.quaternion),i.position.copy(this.camera.position).add(c),i.lookAt(this.camera.position),this.scene.add(i),await E({type:"image",url:e,position:i.position.clone(),uuid:i.uuid}),await F(e,t)}))},async addAudio(e,t){const n=new Audio(e),o=new l.iNn(.5,.5,.5),a=new l.V9B({color:65280}),r=new l.eaF(o,a),i=5,s=new l.Pq0(0,0,-i);s.applyQuaternion(this.camera.quaternion),r.position.copy(this.camera.position).add(s),r.userData={onClick:()=>n.play()},this.scene.add(r),await E({type:"audio",url:e,position:r.position.clone(),uuid:r.uuid}),await F(e,t)},async addModel(e,t,n){let o;switch(n){case"gltf":case"glb":o=new w.B;break;case"obj":o=new h.L;break;case"fbx":o=new p.w;break;case"stl":o=new m.t;break;case"dae":o=new f.q;break;case"3ds":o=new b.b;break;case"ply":o=new y.Z;break;case"wrl":o=new v.F;break;default:return void console.error("Unsupported model file type")}o.load(e,(async o=>{let a;if(o.scene)a=o.scene;else if(o.isBufferGeometry){const e=new l._4j;a=new l.eaF(o,e)}else a=o;const r=5,i=new l.Pq0(0,0,-r);i.applyQuaternion(this.camera.quaternion),a.position.copy(this.camera.position).add(i),this.scene.add(a),await E({type:"model",url:e,extension:n,position:a.position.clone(),uuid:a.uuid}),await F(e,t)}))},async loadObjects(){const e=await A();for(const t of e)switch(t.type){case"image":await this.loadImageFromData(t);break;case"audio":await this.loadAudioFromData(t);break;case"model":await this.loadModelFromData(t);break}},async loadImageFromData(e){const t=URL.createObjectURL(await M(e.url)),n=new l.Tap;n.load(t,(t=>{const n=t.image.width/t.image.height,o=new l.bdM(2,2/n),a=new l.V9B({map:t,side:l.$EB}),r=new l.eaF(o,a);r.position.copy(e.position),this.scene.add(r);const i=()=>{requestAnimationFrame(i),r.rotation.y+=.01};i()}))},async loadAudioFromData(e){const t=URL.createObjectURL(await M(e.url)),n=new Audio(t),o=new l.iNn(.5,.5,.5),a=new l.V9B({color:65280}),r=new l.eaF(o,a);r.position.copy(e.position),r.userData={onClick:()=>n.play()},this.scene.add(r)},async loadModelFromData(e){const t=URL.createObjectURL(await M(e.url));let n;switch(e.extension){case"gltf":case"glb":n=new w.B;break;case"obj":n=new h.L;break;case"fbx":n=new p.w;break;case"stl":n=new m.t;break;case"dae":n=new f.q;break;case"3ds":n=new b.b;break;case"ply":n=new y.Z;break;case"wrl":n=new v.F;break;default:return void console.error("Unsupported model file type")}n.load(t,(t=>{let n;if(t.scene)n=t.scene;else if(t.isBufferGeometry){const e=new l._4j;n=new l.eaF(t,e)}else n=t;n.position.copy(e.position),this.scene.add(n)}))},async clearObjects(){await O(),this.objects.forEach((e=>{const t=this.scene.getObjectByProperty("uuid",e.uuid);t&&this.scene.remove(t)})),this.objects=[]}},beforeUnmount(){window.removeEventListener("resize",this.checkOrientation),window.removeEventListener("orientationchange",this.checkOrientation),document.removeEventListener("pointerlockerror",this.onPointerLockError),document.removeEventListener("keydown",this.onKeyDown),document.removeEventListener("keyup",this.onKeyUp),document.removeEventListener("touchstart",this.onTouchStart),document.removeEventListener("touchmove",this.onTouchMove),window.removeEventListener("keydown",this.handleKeydown)}},B=n(6262);const C=(0,B.A)(x,[["render",d]]);var R=C;const D={class:"upload-menu"};function P(e,t,n,o,r,i){return(0,a.uX)(),(0,a.CE)("div",D,[(0,a.Lk)("input",{type:"file",onChange:t[0]||(t[0]=(...e)=>i.handleFileUpload&&i.handleFileUpload(...e))},null,32)])}var $={methods:{handleFileUpload(e){const t=e.target.files[0];this.$emit("upload",t)}}};const K=(0,B.A)($,[["render",P]]);var T=K,q={name:"WhiteCubeRoom",components:{ThreeJSScene:R,UploadMenu:T},data(){return{showUploadMenu:!1}},mounted(){window.addEventListener("keydown",this.handleKeydown)},beforeUnmount(){window.removeEventListener("keydown",this.handleKeydown)},methods:{toggleUploadMenu(){this.showUploadMenu=!this.showUploadMenu,this.showUploadMenu?document.exitPointerLock():this.$refs.threeScene.controls&&!1===this.$refs.threeScene.controls.isLocked&&this.$refs.threeScene.controls.lock()},handleKeydown(e){switch(e.key.toLowerCase()){case"b":this.toggleUploadMenu();break;case"c":this.$refs.threeScene.clearObjects();break;default:break}},handleUpload(e){const t=URL.createObjectURL(e),n=e.name.split(".").pop().toLowerCase();switch(console.log("Uploading file:",e),n){case"jpg":case"jpeg":case"png":case"gif":this.$refs.threeScene.addImage(t,e);break;case"mp3":case"wav":this.$refs.threeScene.addAudio(t,e);break;case"gltf":case"glb":case"obj":case"fbx":case"stl":case"dae":case"3ds":case"ply":case"x3d":case"wrl":this.$refs.threeScene.addModel(t,n,e);break;default:console.error("Unsupported file type")}this.showUploadMenu=!1,this.$refs.threeScene.controls&&this.$refs.threeScene.controls.lock()}}};const X=(0,B.A)(q,[["render",s]]);var W=X,I={name:"App",components:{WhiteCubeRoom:W}};const z=(0,B.A)(I,[["render",i]]);var J=z;(0,o.Ef)(J).mount("#app")},852:function(e,t,n){e.exports=n.p+"img/megaworld.f0fc96be.png"}},t={};function n(o){var a=t[o];if(void 0!==a)return a.exports;var r=t[o]={exports:{}};return e[o].call(r.exports,r,r.exports,n),r.exports}n.m=e,function(){var e=[];n.O=function(t,o,a,r){if(!o){var i=1/0;for(l=0;l<e.length;l++){o=e[l][0],a=e[l][1],r=e[l][2];for(var s=!0,c=0;c<o.length;c++)(!1&r||i>=r)&&Object.keys(n.O).every((function(e){return n.O[e](o[c])}))?o.splice(c--,1):(s=!1,r<i&&(i=r));if(s){e.splice(l--,1);var d=a();void 0!==d&&(t=d)}}return t}r=r||0;for(var l=e.length;l>0&&e[l-1][2]>r;l--)e[l]=e[l-1];e[l]=[o,a,r]}}(),function(){n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){n.p="/meganew/"}(),function(){var e={524:0};n.O.j=function(t){return 0===e[t]};var t=function(t,o){var a,r,i=o[0],s=o[1],c=o[2],d=0;if(i.some((function(t){return 0!==e[t]}))){for(a in s)n.o(s,a)&&(n.m[a]=s[a]);if(c)var l=c(n)}for(t&&t(o);d<i.length;d++)r=i[d],n.o(e,r)&&e[r]&&e[r][0](),e[r]=0;return n.O(l)},o=self["webpackChunkmegatest"]=self["webpackChunkmegatest"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))}();var o=n.O(void 0,[504],(function(){return n(3741)}));o=n.O(o)})();
//# sourceMappingURL=app.b3ff3ed3.js.map