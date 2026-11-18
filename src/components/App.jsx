
import React, { useEffect, useState } from "react";

import Header from "./Header";
import ToyForm from "./ToyForm";
import ToyContainer from "./ToyContainer";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [toys, setToys] = useState([]);

  // Fetch all toys when the application loads
  useEffect(() => {
    fetch("http://localhost:3001/toys")
      .then((response) => response.json())
      .then((data) => {
        setToys((currentToys) => {
          const fetchedIds = new Set(
            data.map((toy) => String(toy.id))
          );

          const newlyAddedToys = currentToys.filter(
            (toy) => !fetchedIds.has(String(toy.id))
          );

          return [...data, ...newlyAddedToys];
        });
      })
      .catch((error) => {
        console.error("Error fetching toys:", error);
      });
  }, []);

  // Show or hide the toy form
  function handleClick() {
    setShowForm((showForm) => !showForm);
  }

  // Create a new toy
  async function handleAddToy(newToy) {
    const response = await fetch("http://localhost:3001/toys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newToy,
        likes: 0,
      }),
    });

    if (response.ok === false) {
      throw new Error("Could not create toy");
    }

    const createdToy = await response.json();

    setToys((currentToys) => [
      ...currentToys,
      createdToy,
    ]);
  }

  // Donate (delete) a toy
  async function handleDonateToy(toyId) {
    const response = await fetch(
      `http://localhost:3001/toys/${toyId}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok === false) {
      throw new Error("Could not delete toy");
    }

    setToys((currentToys) =>
      currentToys.filter((toy) => toy.id !== toyId)
    );
  }

  // Like a toy
  async function handleLikeToy(toy) {
    const response = await fetch(
      `http://localhost:3001/toys/${toy.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          likes: toy.likes + 1,
        }),
      }
    );

    if (response.ok === false) {
      throw new Error("Could not update toy likes");
    }

    const updatedToy = await response.json();

    setToys((currentToys) =>
      currentToys.map((currentToy) =>
        currentToy.id === updatedToy.id
          ? updatedToy
          : currentToy
      )
    );
  }

  return (
    <>
      <Header />

      {showForm ? (
        <ToyForm onAddToy={handleAddToy} />
      ) : null}

      <div className="buttonContainer">
        <button onClick={handleClick}>Add a Toy</button>
      </div>

      <ToyContainer
        toys={toys}
        onLikeToy={handleLikeToy}
        onDonateToy={handleDonateToy}
      />
    </>
  );
}

export default App;
