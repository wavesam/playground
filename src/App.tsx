import { useState, useEffect, useRef } from "react";
import Matter from "matter-js";

function App() {
  const [inputValue, setInputValue] = useState("");

  // We use a Ref for the physics engine to read "live" values without re-running useEffect
  const textRef = useRef("");

  useEffect(() => {
    textRef.current = inputValue;
  }, [inputValue]);

  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // This is the 'anchor' to the real world
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Setup the engine and renderer
    const engine = Matter.Engine.create({
      positionIterations: 10, // Default is 6
      velocityIterations: 10, // Default is 4
    });
    const render = Matter.Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#ffffff",
      },
    });

    // 2. Create container
    const ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight,
      window.innerWidth,
      20,
      { isStatic: true }
    );

    const ceiling = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      -20,
      window.innerWidth,
      20,
      { isStatic: true }
    );

    const leftWall = Matter.Bodies.rectangle(
      -20,
      window.innerHeight / 2,
      20,
      window.innerHeight,
      { isStatic: true }
    );

    const rightWall = Matter.Bodies.rectangle(
      window.innerWidth + 20,
      window.innerHeight / 2,
      20,
      window.innerHeight,
      { isStatic: true }
    );

    Matter.Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    const createTextTexture = (text: any, color = "#3498db") => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get 2D context");
      }

      // Set a large enough base size for high quality
      canvas.width = 200;
      canvas.height = 60;

      ctx.fillStyle = color;
      ctx.font = "bold 30px Helvetica";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);

      return canvas.toDataURL();
    };

    // Pressing the "enter" key creates a box at the top
    const handleKeyDown = (e: any) => {
      if (e.key.toLowerCase() === "enter") {
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const y = 0;
        const textToDrop = textRef.current || "Hello";
        const box = Matter.Bodies.rectangle(x, y, 150, 50, {
          render: {
            sprite: {
              texture: createTextTexture(textToDrop),
              xScale: 1,
              yScale: 1,
            },
          },
        });
        Matter.Composite.add(engine.world, [box]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const handleMouseClicked = () => {
      const x = mousePosRef.current.x;
      const y = mousePosRef.current.y;
      const box = Matter.Bodies.rectangle(x, y, 100, 100, {
        restitution: 1,
      });
      Matter.Composite.add(engine.world, [box]);
    };

    window.addEventListener("click", handleMouseClicked);

    // 4. Run the engine & renderer
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // 5. Cleanup on unmount
    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      Matter.Runner.stop(runner);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return (
    <div>
      <div ref={sceneRef} style={{ width: "100vw", height: "100vh" }} />
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <p style={{ color: "#666", fontSize: "12px" }}>Press 'Enter' to drop</p>
      </div>
    </div>
  );
}

export default App;
