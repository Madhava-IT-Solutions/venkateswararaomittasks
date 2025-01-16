import React, { useEffect, useState, useRef } from "react";
import "../Models/styles/model.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Bounds, Loader } from "@react-three/drei";
import { Box3, Vector3, TextureLoader, RepeatWrapping, Color } from "three";
import * as THREE from "three";
import { colorsPalatte } from "../../data/colorsPalatte";
const DynamicMaterialModel = ({
  modelPath,
  materialUpdates,
  onPartSelected,
}) => {
  const { scene } = useGLTF(modelPath);
  const [hoveredPart, setHoveredPart] = useState(null);
  const modelRef = useRef();

  useEffect(() => {
    if (modelRef.current) {
      const boundingBox = new Box3().setFromObject(modelRef.current);
      const size = new Vector3();
      boundingBox.getSize(size);
      console.log("Width:", size.x);
      console.log("Height:", size.y);
      console.log("Depth:", size.z);
    }

    scene.traverse((child) => {
      if (child.isMesh) {
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color,
            roughness: 0.5,
            metalness: 0.5,
          });
        }

        const update = materialUpdates[child.uuid];
        if (update) {
          if (update.color) {
            child.material.color = new Color(update.color);
          }
          child.material.needsUpdate = true;
        }

        if (child.uuid === hoveredPart) {
          child.material.emissive = new THREE.Color(0xaaaaaa);
          child.material.emissiveIntensity = 0.5;
        } else {
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [scene, materialUpdates, hoveredPart]);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    const selectedPart = event.object.uuid;
    const materialName = event.object.material.name;
    onPartSelected(selectedPart, materialName);
  };

  const handlePointerOver = (event) => {
    setHoveredPart(event.object.uuid);
  };

  const handlePointerOut = () => {
    setHoveredPart(null);
  };

  return (
    <primitive
      object={scene}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      ref={modelRef}
    />
  );
};

const Model6 = () => {
  const [selectedPart, setSelectedPart] = useState(null);
  const [materialUpdates, setMaterialUpdates] = useState({});
  const [color, setColor] = useState("#ff6347");
  const handlePartSelection = (partId, materialName) => {
    setSelectedPart({ id: partId, name: materialName });
    const existingProps = materialUpdates[partId] || {};
    setColor(existingProps.color || "#ff6347");
    setSelectedTexture(existingProps.texture || null);
  };
  const applyChanges = () => {
    if (selectedPart) {
      setMaterialUpdates((prevUpdates) => ({
        ...prevUpdates,
        [selectedPart.id]: { color },
      }));
    }
  };
  const handlePrint = () => {
    // Open the print dialog
    window.print();
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Interactive Page",
          text: "Check out this amazing page!",
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };
  const handleReset = () => {
    // Reload the page
    window.location.reload();
  };
  return (
    <div className="main">
      <div>
        <h2 className="main_heading">Customize Futuristic Building Model</h2>
        <div className="row">
          <div className="col-lg-2 left" style={{ position: "relative" }}>
            <div>
              <div className="select_part text-center pt-3 ">
                <h5>Selected Part</h5>
                <p className="fw-bold" style={{ color: "#a20000" }}>
                  {selectedPart
                    ? selectedPart.name
                    : "Click on a part of the model"}
                </p>
              </div>

              <div className="text-center mx-lg-2">
                <h4 className="text-center">Choose Colour</h4>
                <div
                  className="custom-scroll"
                  style={{
                    display: "flex",
                    textAlign: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    height: "80vh",
                    overflowY: "scroll",
                    backgroundColor: "white",
                    padding: "10px",
                  }}
                >
                  {colorsPalatte.map((paletteColor) => (
                    <div style={{ width: "51px" }}>
                      <p
                        key={paletteColor.code}
                        style={{
                          width: "50px",
                          height: "50px",
                          boxShadow: "1px 1px 3px black",
                          backgroundColor: paletteColor.code,
                          cursor: "pointer",
                          border:
                            color === paletteColor.code
                              ? "2px solid black"
                              : "1px solid gray",
                          marginBottom: "0px",
                        }}
                        onClick={() => setColor(paletteColor.code)}
                      ></p>
                      <p
                        className="mb-0 "
                        style={{ overflow: "hidden", height: "20px" }}
                      >
                        {paletteColor.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className=" d-flex justify-content-around align-items-center">
                  <span className="pr-2">Choose Custom Colour</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={!selectedPart}
                    style={{
                      height: "19px",
                      width: "38px",
                      marginTop: "2px",
                      border: "none",
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-success fw-bolder"
                  onClick={applyChanges}
                  disabled={!selectedPart}
                >
                  Apply Colour
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-10">
            <div
              style={{ width: "100%", height: "100vh" }}
              className="model-container"
            >
              <Canvas style={{ width: "100%", height: "100vh" }}>
                <ambientLight intensity={2} />
                <directionalLight position={[22, 20, 10]} />
                <OrbitControls
                  enablePan={true} // Allows panning the camera
                  enableZoom={true} // Allows zooming the camera
                  enableRotate={true} // Allows rotating the model
                  maxPolarAngle={Math.PI / 1} // Optional: Limit vertical rotation (e.g., prevent flipping)
                  minPolarAngle={0} // Optional: Limit vertical rotation
                  enableDamping={true}
                  dampingFactor={0.9}
                />

                <React.Suspense fallback={null}>
                  <Bounds fit clip margin={2}>
                    <DynamicMaterialModel
                      modelPath="https://ssvconstructions.in/wp-content/uploads/2025/01/glb_files/futuristic_building.glb" // Your GLTF model path
                      materialUpdates={materialUpdates}
                      onPartSelected={handlePartSelection}
                    />
                  </Bounds>
                </React.Suspense>
              </Canvas>
              <Loader
                containerStyles={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }} // Custom container styles
                innerStyles={{ color: "#fff", fontSize: "16px" }} // Custom text styles
                barStyles={{
                  background: "#ff6347",
                  width: "100%",
                  height: "5px",
                }} // Custom bar styles
                dataInterpolation={(p) => `Loading: ${p.toFixed(5)}%`}
              />
            </div>
            <div>
              <div className="d-flex  gap-2 justify-content-center">
                <div>
                  <button
                    onClick={handlePrint}
                    className="w-30 fw-bold"
                    style={{
                      color: "white",
                      backgroundColor: "#800000",
                      borderRadius: "10px",
                      border: "none",
                      padding: "5px",
                    }}
                  >
                    <img
                      src="	https://cdn-icons-png.flaticon.com/512/10009/10009249.png"
                      alt="SSV"
                      className="footer-image m-1"
                      width="20px"
                      height="20px"
                    />{" "}
                    Download
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleShare}
                    className="w-30 fw-bold"
                    style={{
                      color: "white",
                      backgroundColor: "#800000",
                      borderRadius: "10px",
                      border: "none",
                      padding: "5px",
                    }}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/189/189676.png"
                      alt="SSV"
                      className="footer-image m-1"
                      width="20px"
                      height="20px"
                    />{" "}
                    Share
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleReset}
                    className="w-30 fw-bold"
                    style={{
                      color: "white",
                      backgroundColor: "#800000",
                      borderRadius: "10px",
                      border: "none",
                      padding: "5px",
                    }}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/6066/6066733.png"
                      alt="SSV"
                      className="footer-image m-1"
                      width="20px"
                      height="20px"
                    />{" "}
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Model6;
