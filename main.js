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
            console.log( child );

            if( child.isMesh ){
                child.castShadow = true; 
                child.receiveShadow = true;
            } 
        } )
        
        scene.add( glb.scene );

    }, 
    undefined, 
    function ( error ) {

        console.error( error );

    } 
);


// Luz ________________________________________________________________________

const sun = new THREE.DirectionalLight( 0xFFFFFF );
sun.position.set( 20, 12, 0); 

scene.add( sun );

const sunHelper = new THREE.DirectionalLightHelper( sun, 5 );
scene.add( sunHelper );

const light = new THREE.AmbientLight( 0x404040, 8 ); // soft white light
scene.add( light );


// Sombras ________________________________________________________________________

renderer.shadowMap.enabled = true;
sun.castShadow = true;
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;

const shadowHelper = new THREE.CameraHelper( sun.shadow.camera );
scene.add( shadowHelper );


// Loop ________________________________________________________________________

function handleResize(){
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    const aspect = size.width / size.height;
    -aspect * frustum - frustumLeftRightCorrection,
    aspect * frustum - frustumLeftRightCorrection,
    camera.top = frustum;
    camera.bottom = -frustum;

    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )
}   

window.addEventListener( "resize", handleResize )

function animate() {
    renderer.render( scene, camera );
    // console.log( camera.position );
}

renderer.setAnimationLoop( animate );