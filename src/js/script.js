import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Importação de texturas
import starsTexture from '../img/stars.jpg';
import sunTexture from '../img/sun.jpg';
import mercuryTexture from '../img/mercury.jpg';
import venusTexture from '../img/venus.jpg';
import moonTexture from '../img/moon.jpg';
import earthTexture from '../img/earth.jpg';
import marsTexture from '../img/mars.jpg';
import jupiterTexture from '../img/jupiter.jpg';
import saturnTexture from '../img/saturn.jpg';
import saturnRingTexture from '../img/saturn ring.png';
import uranusTexture from '../img/uranus.jpg';
import uranusRingTexture from '../img/uranus ring.png';
import neptuneTexture from '../img/neptune.jpg';

// Configurações principais
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-90, 140, 140);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.update();

// Adição de luzes
scene.add(new THREE.AmbientLight(0x333333));
const pointLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(pointLight);

// Configuração de fundo
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load(Array(6).fill(starsTexture));

// Carregador de texturas
const textureLoader = new THREE.TextureLoader();

// Lista para armazenar os meteoros
const meteors = [];

// Função para criar um meteoro
function createMeteor() {
  const geo = new THREE.SphereGeometry(0.5, 16, 16); // Pequena esfera
  const mat = new THREE.MeshBasicMaterial({ color: 0xffa500 }); // Cor alaranjada
  const meteor = new THREE.Mesh(geo, mat);

  // Define a posição inicial e o destino do meteoro
  meteor.position.set(
    Math.random() * 400 - 200, // Entre -200 e 200 no eixo X
    Math.random() * 200 - 100, // Entre -100 e 100 no eixo Y
    -300 // Inicia longe no eixo Z
  );

  meteor.destination = new THREE.Vector3(
    Math.random() * 400 - 200, // Posição final no eixo X
    Math.random() * 200 - 100, // Posição final no eixo Y
    300 // Termina longe no eixo Z
  );

  meteors.push(meteor);
  scene.add(meteor);
}

// Variável de controle para os meteoros
let meteorsEnabled = false;

// Evento para alternar o estado dos meteoros
document.getElementById('toggle-meteors').addEventListener('click', () => {
  meteorsEnabled = !meteorsEnabled;
  document.getElementById('toggle-meteors').textContent = `Mostrar Meteoros: ${
    meteorsEnabled ? 'On' : 'Off'
  }`;

  if (!meteorsEnabled) {
    // Remove todos os meteoros da cena
    meteors.forEach((meteor) => scene.remove(meteor));
    meteors.length = 0; // Limpa a lista de meteoros
  }
});

// Função para atualizar os meteoros
function updateMeteors() {
  if (!meteorsEnabled) return; // Não cria ou atualiza meteoros se estiverem desativados

  // Atualiza a posição dos meteoros
  for (let i = meteors.length - 1; i >= 0; i--) {
    const meteor = meteors[i];

    // Move o meteoro em direção ao destino
    meteor.position.lerp(meteor.destination, 0.003);

    // Remove o meteoro se atingir o destino
    if (meteor.position.distanceTo(meteor.destination) < 1) {
      scene.remove(meteor);
      meteors.splice(i, 1);
    }
  }

  // Adiciona um novo meteoro aleatoriamente
  if (Math.random() < 0.0025) {
    createMeteor();
  }
}

// Função para criar planetas
function createPlanet(
  size,
  texture,
  orbitRadius,
  ring = null,
  hasMoon = false,
  moonTexture = null
) {
  const planetSystem = new THREE.Group();

  // Planeta
  const planetGeo = new THREE.SphereGeometry(size, 30, 30);
  const planetMat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
  });
  const planetMesh = new THREE.Mesh(planetGeo, planetMat);
  planetSystem.add(planetMesh);

  // Anel (opcional)
  if (ring) {
    const ringGeo = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    planetSystem.add(ringMesh);
  }

  // Lua (opcional)
  if (hasMoon) {
    const moonGeo = new THREE.SphereGeometry(size / 5, 30, 30);
    const moonMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load(moonTexture),
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.x = 10;
    planetSystem.add(moonMesh);
    planetSystem.userData.moonMesh = moonMesh;
  }

  planetSystem.userData.orbitRadius = orbitRadius;
  scene.add(planetSystem);
  return planetSystem;
}

// Lista para armazenar as órbitas
const orbits = [];

// Função para criar órbitas
function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius);
  const points = curve.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, 0, p.y))
  );
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbits.push(orbit); // Armazena a órbita na lista
  scene.add(orbit);
}

// Criação do Sol
const sun = (() => {
  const geo = new THREE.SphereGeometry(16, 30, 30);
  const mat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture),
  });
  const sunMesh = new THREE.Mesh(geo, mat);
  scene.add(sunMesh);
  return sunMesh;
})();

// Criação dos planetas
const planets = [
  { name: 'sun', system: sun },
  { name: 'mercury', system: createPlanet(3.2, mercuryTexture, 28) },
  { name: 'venus', system: createPlanet(5.8, venusTexture, 44) },
  {
    name: 'earth',
    system: createPlanet(6, earthTexture, 62, null, true, moonTexture),
  },
  { name: 'mars', system: createPlanet(4, marsTexture, 78) },
  { name: 'jupiter', system: createPlanet(12, jupiterTexture, 100) },
  {
    name: 'saturn',
    system: createPlanet(10, saturnTexture, 138, {
      innerRadius: 10,
      outerRadius: 20,
      texture: saturnRingTexture,
    }),
  },
  {
    name: 'uranus',
    system: createPlanet(7, uranusTexture, 176, {
      innerRadius: 7,
      outerRadius: 12,
      texture: uranusRingTexture,
    }),
  },
  { name: 'neptune', system: createPlanet(7, neptuneTexture, 200) },
];

// Criação das órbitas
planets
  .slice(1)
  .forEach(({ system }) => createOrbit(system.userData.orbitRadius));

// Função de animação
let speedNew = 1;
let focusedPlanet = null;
let time = 0;
function animate() {
  time += 0.09 * speedNew;

  // Rotação do Sol
  sun.rotation.y += 0.005;

  // Movimentação e rotação dos planetas
  planets.slice(1).forEach(({ system }, index) => {
    const speed = 0.1 / (index + 1);
    const orbitRadius = system.userData.orbitRadius;
    system.position.set(
      Math.cos(time * speed) * orbitRadius,
      0,
      Math.sin(time * speed) * orbitRadius
    );

    system.rotation.y += 0.005;

    // Movimentação da lua
    const moon = system.userData.moonMesh;
    if (moon) {
      moon.position.set(
        Math.cos(time * 0.9) * 10,
        0,
        Math.sin(time * 0.9) * 10
      );
    }
  });

  // Atualiza a posição da câmera para o planeta selecionado
  if (focusedPlanet) {
    const { position } = focusedPlanet.system;
    const offset = 50; // Ajuste a distância da câmera
    camera.position.set(
      position.x + offset,
      position.y + offset,
      position.z + offset
    );
    orbitControls.target.copy(position);
  }

  orbitControls.update();
  updateMeteors(); // Atualiza os meteoros

  renderer.render(scene, camera);
}

// Controle de visibilidade das órbitas
let orbitsVisible = true;
document.getElementById('toggle-orbits').addEventListener('click', () => {
  orbitsVisible = !orbitsVisible;
  document.getElementById('toggle-orbits').textContent = `Mostrar Órbitas: ${
    orbitsVisible ? 'On' : 'Off'
  }`;

  // Atualiza a visibilidade de todas as órbitas
  orbits.forEach((orbit) => {
    orbit.visible = orbitsVisible;
  });
});

// Controle de foco na câmera
document.getElementById('planet-focus').addEventListener('change', (event) => {
  const selectedValue = event.target.value;

  if (selectedValue === 'default') {
    // Volta para a visão geral
    focusedPlanet = null;
    camera.position.set(-90, 140, 140);
    orbitControls.target.set(0, 0, 0);
  } else {
    // Foco no planeta selecionado
    focusedPlanet = planets.find(({ name }) => name === selectedValue);
  }

  orbitControls.update();
});

// Loop de animação e redimensionamento
renderer.setAnimationLoop(animate);

// Selecionando os botões
const increaseSpeedButton = document.getElementById('increaseSpeedButton');
const decreaseSpeedButton = document.getElementById('decreaseSpeedButton');

// Eventos para alterar a velocidade
increaseSpeedButton.addEventListener('click', () => {
  speedNew += 0.2;
});

decreaseSpeedButton.addEventListener('click', () => {
  if (speedNew > 0.1) {
    speedNew -= 0.2;
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
