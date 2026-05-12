export function preloadImages(urls: (string | undefined)[]): Promise<void[]> {
  const validUrls = urls.filter((url): url is string => !!url);
  if (validUrls.length === 0) return Promise.resolve([]);

  return Promise.all(
    validUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  );
}
