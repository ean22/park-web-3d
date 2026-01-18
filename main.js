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

const camera = new THREE.PerspectiveCamera( 
    75, 
    size.width / size.height, 
    0.1, 
    1000 );

camera.position.x = 5.73177155135177;
camera.position.y = 0.7358715786179494;
camera.position.z = -2.7109513188562078;

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

document.body.appendChild( renderer.domElement );


const loader = new GLTFLoader();
loader.load( './public/park.glb', function ( glb ) {
    scene.add( glb.scene );

}, undefined, function ( error ) {

    console.error( error );

} );

const light = new THREE.AmbientLight( 0x404040, 8 ); // soft white light
scene.add( light );


function handleResize(){
    size.width = window.innerWidth;
    size.height = window.innerHeight;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )
}   

window.addEventListener( "resize", handleResize )

function animate() {
    renderer.render( scene, camera );
    console.log( camera.position, camera.rotation );
}

renderer.setAnimationLoop( animate );