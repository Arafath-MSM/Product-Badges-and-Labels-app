export const loader = async () => {
  return Response.json({ status: "ok" }, {
    headers: { "Cache-Control": "no-store" },
  });
};
