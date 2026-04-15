function SearchBar() {
  const handleSubmit = (e: any) => {
    e.preventDefault(); // Prevents page reload
    const data = new FormData(e.target);
    console.log("Input submitted:", data.get("userInput"));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        style={{
          position: "fixed",
          bottom: "50px",
          left: "50px",
          padding: "10px",
          paddingRight: "50px",
          borderRadius: "10px",
        }}
        name="userInput"
        type="text"
        placeholder="Type and press Enter"
      />
    </form>
  );
}

export default SearchBar;
