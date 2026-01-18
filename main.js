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
// const intersectObjects = [];
// const intersectObjectsNames = [
//     "Scene",
//     "Plane",
//     "Plane_1",
//     "Plane_2",
//     "Plane_3",
//     "Plane_4",
//     "Plane_5",
//     "Plane_6",
//     "Plane_7",
//     "Plane_8",
//     "Plane008",
//     "Plane008_1",
//     "painel",
//     "Cube012",
//     "Cube012_1",
//     "Cube012_2",
//     "Cube012_3"
// ];


const loader = new GLTFLoader();
loader.load( 
    './public/park.glb', 
    function ( glb ) {
        glb.scene.traverse( child => {
            // if( intersectObjectsNames.includes( child.name )){
            //     intersectObjects.push( child );
            // }
            
            if( child.isMesh ){
                child.castShadow = true; 
                child.receiveShadow = true;
            } 
            // console.log(child);
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

const sunHelper = new THREE.DirectionalLightHelper( sun, 5 );
scene.add( sunHelper );

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

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );

// Raycaster ________________________________________________________________________

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();



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
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener( "pointermove", onPointerMove );


// Loop ________________________________________________________________________

function animate() {
    raycaster.setFromCamera( pointer, camera );

    const intersects = raycaster.intersectObjects( scene.children );

    if( intersects.length > 0 ){
        document.body.style.cursor = "pointer";
    }

    for( let i = 0; i < intersects.length; i++ ){
        console.log( intersects[ 0 ].object.parent.name );
    }

    renderer.render( scene, camera );
}
    

renderer.setAnimationLoop( animate );