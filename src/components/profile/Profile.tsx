import "./profile.css";
import { useState } from "react";
import ChampionTable from "../tables/ChampionTable";
import ProfileTable from "../tables/ProfileTable/ProfileTable";
import ProfileTopBar from "../shared/ProfileTopBar";
import { useLocation } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export default function Profile() {
  const [page, setPage] = useState<number>(1);
  const location = useLocation();
  const { gameName, tagLine } = location.state.data;

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
  };

  return (
    <>
      <div
        id="backgroundImage"
        style={{
          backgroundImage: "url(static://assets/howling_abyss_nexus.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "blur(5px)",
          height: "100vh",
          width: "100vw",
          scale: "1.05",
        }}
      />
      <div id="main">
        <ProfileTopBar gameName={gameName} tagLine={tagLine} />
        <Carousel
          additionalTransfrom={0}
          arrows
          centerMode={false}
          containerClass="carousel-container"
          dotListClass=""
          focusOnSelect={false}
          itemClass=""
          keyBoardControl
          pauseOnHover
          renderArrowsWhenDisabled={false}
          renderButtonGroupOutside={false}
          renderDotsOutside={false}
          responsive={{
            desktop: {
              breakpoint: {
                max: 3000,
                min: 1024,
              },
              items: 1,
            },
          }}
          showDots
        >
          <div className="carousel-item">
            <ChampionTable />
          </div>
          <div className="carousel-item">
            <ProfileTable />
          </div>
        </Carousel>
      </div>
    </>
  );
}
