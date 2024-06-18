import '../styles/Home.css'
const Home = () => {
    return (
      <div className="home">
        <h1>Welcome to When2Eat!</h1>
        <p>The one stop place to fix the indecisiveness of finding restaurants and eating out.</p>

        <h2>How it works:</h2>
        <p>You can navigate to Wheel and start a lobby (or join an existing one) where you are able
          to input and select restaurant choices with friends and other users. After selecting restaurants,
          you can adjust the wheel chances through adding points (that can be obtained from getting your
          choice selected or through daily claiming) and then spin the wheel. The result of the wheel is
          now the restaurant that has been decided! Have fun :)
        </p>
        {/* <div id="info"><br /></div>
        <button onClick={loadInfo}>YO</button> */}
      </div>
    )
  }

  export default Home