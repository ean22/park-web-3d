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
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )
document.body.appendChild( renderer.domElement );


// Camera________________________________________________________________________

let aspect = size.width / size.height;
const frustum = 2;
let a = 0;
const camera = new THREE.OrthographicCamera( 
    -aspect * frustum,
    aspect * frustum,
    frustum,
    -frustum,
    0.1, 
    1000 
);

camera.position.x = 8.7 + a;
camera.position.y = 4.1 + a;
camera.position.z = -9.1;

scene.add( camera );


// Controles________________________________________________________________________

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();


// Modelo 3D ________________________________________________________________________

const loader = new GLTFLoader();
loader.load( './public/park.glb', function ( glb ) {
    scene.add( glb.scene );

}, undefined, function ( error ) {

    console.error( error );

} );


// Luz ________________________________________________________________________

const sum = new THREE.DirectionalLight( 0xFFFFFF );
scene.add( sum );

const helper = new THREE.DirectionalLightHelper( sum, 5 );
scene.add( helper );

const light = new THREE.AmbientLight( 0x404040, 8 ); // soft white light
scene.add( light );


// Loop ________________________________________________________________________

function handleResize(){
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    const aspect = size.width / size.height;
    camera.left = -aspect * frustum;
    camera.right = aspect * frustum;
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