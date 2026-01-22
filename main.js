import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

let size = {
    width: window.innerWidth,
    height: window.innerHeight
};

const scene = new THREE.Scene();
// scene.background = "196, 255, 255";

const renderer = new THREE.WebGLRenderer( {antialias:true} );
renderer.setSize( size.width, size.height );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = 1.2;

const character = {
    instance: null,
    isMoving: false
};

document.body.appendChild( renderer.domElement );


// Fisicas ________________________________________________________________________
const GRAVITY = 30;
const CAPSULE_RADIUS = 0.35; 
const CAPSULE_HEIGHT = 1;
const JUMP_HEIGHT = 15;
const MOVE_SPEED = 1;

const colliderOctree = new Octree();
const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0), 
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0)
);

let playerOnFloor = false;
let playerVelocity = new THREE.Vector3();
let targetRotation = 0;

// Camera ________________________________________________________________________

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
    './public/park2.glb', 
    function ( glb ) {
        glb.scene.traverse( child => {
            
            if( child.isMesh ){
                child.castShadow = true; 
                child.receiveShadow = true;
            } ;

            // console.log(child);

            if( child.name === "coelho"){
                character.instance = child;
                playerCollider.start
                    .copy(child.position)
                    .add(new THREE.Vector3(0, CAPSULE_RADIUS, 0));
            };

            if( child.name === "colisao"){
                colliderOctree.fromGraphNode(child);
            };

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


// Conteúdo Modal ________________________________________________________________________

const content = {
    title: "Meu Primeiro Projeto ",
    content: 
    `Esse é meu primeiro projeto utiliznado a biblioteca three.js <br>
    A experiência foi inovadora pois a biblioteca permite criar coisas "fora-da-caixa" com resultados visuais incriveis. 
    ` 
};


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
};

function onPointerMove( event ) {
    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
};

function onClick(){
    // console.log( intersectObject );
    const modal = document.querySelector(".modal");
    if( intersectObject === "painel"){
        updateModalContent();
        modal.classList.toggle("hidden");
        
    } else{
        if(!modal.classList.contains("hidden")){
            modal.classList.toggle("hidden");
        }
    }
};

function onKeyDown( event ){  
    if( character.isMoving ) return;

    switch ( event.key.toLowerCase() ) {
        case 'w':
            playerVelocity.x -= MOVE_SPEED;
            targetRotation = 0;

            break;

        case 'a':
            playerVelocity.z += MOVE_SPEED;
            targetRotation = -Math.PI / 2;

            break;

        case 's':
            playerVelocity.x += MOVE_SPEED;
            targetRotation = Math.PI;
            break;
        
        case 'd':
            playerVelocity.z -= MOVE_SPEED;
            targetRotation = Math.PI / 2;

            break;
    
        default:
            break;
        
        };

    playerVelocity.y = JUMP_HEIGHT;
    character.isMoving = true;
    
};

function updateModalContent(){
    const modalTitle = document.querySelector(".modal-header-wrapper");
    const modalContent = document.querySelector(".modal-content-wrapper");

    modalTitle.innerHTML = content.title;
    modalContent.innerHTML = content.content;


};

function highLight( element ){
    document.body.style.cursor = "pointer";
};

function playerCollision(){
    const result = colliderOctree.capsuleIntersect( playerCollider );
    playerOnFloor = false;

    if( result ){
        playerOnFloor = result.nomal > 0;
        playerCollider.translate( result.normal.multiplyScalar( result.depth ));

        if( playerOnFloor ){
            character.isMoving = false;
            playerVelocity.x = 0;
            playerVelocity.y = 0;
        }
    }
}

function updatePlayer(){
    if( !character.instance ) return;

    if( !playerOnFloor ){
        playerVelocity.y -= GRAVITY * 0.001;
    }

    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.01));
    playerCollision();

    character.instance.position.copy(playerCollider.start);
    character.instance.position.y -= CAPSULE_RADIUS;

    character.instance.rotation.y = THREE.MathUtils.lerp( 
        character.instance.rotation.y, 
        targetRotation, 
        0.1 
    );
}

window.addEventListener( "pointermove", onPointerMove );
window.addEventListener( "resize", onResize );
window.addEventListener( "click", onClick );
window.addEventListener( "keydown", onKeyDown );

// Loop ________________________________________________________________________

function animate() {
    updatePlayer();
    
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
    
    document.body.style.cursor = "default";
    if(intersectObject === "painel")  highLight( intersectObject );

    renderer.render( scene, camera );
}
    

renderer.setAnimationLoop( animate );