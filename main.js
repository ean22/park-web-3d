import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const size = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer( {antialias:true} );
renderer.setSize( size.width, size.height );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.2;

document.body.appendChild( renderer.domElement );


// Camera________________________________________________________________________

let aspect = size.width / size.height;
const frustum = 2;
const frustumLeftRightCorrection = 1.5;
const camera = new THREE.OrthographicCamera( 
    -aspect * frustum - frustumLeftRightCorrection,
    aspect * frustum - frustumLeftRightCorrection,
    frustum,
    -frustum,
    0.1, 
    1000 
);

camera.position.x = 8.7;
camera.position.y = 4.1;
camera.position.z = -9.1;

scene.add( camera );


// Controles________________________________________________________________________

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();


// Modelo 3D ________________________________________________________________________

const loader = new GLTFLoader();
loader.load( 
    './public/park.glb', 
    function ( glb ) {
        glb.scene.traverse( child => {
            
            if( child.isMesh ){
                child.castShadow = true; 
                child.receiveShadow = true;
            } 
            console.log(child);
        } );
        
        scene.add( glb.scene );
    }, 
    undefined, 
    function ( error ) {

        console.error( error );

    } 
);


// Luz ________________________________________________________________________

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.position.set( 10, 12, 0); 
sun.target.position.set( 0, 0, 0 )

scene.add( sun );

// const sunHelper = new THREE.DirectionalLightHelper( sun, 5 );
// scene.add( sunHelper );

const light = new THREE.AmbientLight( 0x404040, 8 ); // soft white light
scene.add( light );


// Sombras ________________________________________________________________________

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

sun.castShadow = true;
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.normalBias = .02;
sun.shadow.mapSize.height = 1024;
sun.shadow.mapSize.width = 1024;

// const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
// scene.add( shadowHelper );

// Raycaster ________________________________________________________________________

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersectObject = "";


// Handlers de Eventos ________________________________________________________________________

function onResize(){
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    
    const aspect = size.width / size.height;
    -aspect * frustum - frustumLeftRightCorrection,
    aspect * frustum - frustumLeftRightCorrection,
    camera.top = frustum;
    camera.bottom = -frustum;
    
    camera.updateProjectionMatrix();
    
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
}   

window.addEventListener( "resize", onResize );


function onPointerMove( event ) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener( "pointermove", onPointerMove );

function onClick (){
    console.log( intersectObject );
    const modal = document.querySelector(".modal");
    if( intersectObject === "painel"){
        modal.classList.toggle("hidden");

        
    } else{
        if(!modal.classList.contains("hidden")){
            modal.classList.toggle("hidden");
        }
    }
}

window.addEventListener( "click", onClick );


// Loop ________________________________________________________________________

function animate() {
    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children, true );

    if( intersects.length > 0 ){
        document.body.style.cursor = "pointer";
    }

    for( let i = 0; i < intersects.length; i++ ){
        // console.log( intersects[ 0 ].object.parent.name );
        // intersects[i].object.material.color.set(0xff0000);

        intersectObject = intersects[ 0 ].object.parent.name;
        
    }
    
    document.body.style.cursor = "default"
    renderer.render( scene, camera );
}
    

renderer.setAnimationLoop( animate );