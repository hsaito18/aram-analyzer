// https://stackoverflow.com/a/70024111

import { useEffect, useState } from "react";

export default (fileName: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await import(`../../public/assets/${fileName}`); // change relative path to suit your needs
        setImage(response.default);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [fileName]);

  return {
    loading,
    error,
    image,
  };
};
