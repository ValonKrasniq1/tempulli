
import AdSlot from "./AdSlot";

export default function BillboardAd() {
  return (
    <section className="tempulli-container py-5">
      <AdSlot
        position="billboard"
        height="150px"
        fixedHeight={true}
        label="HAPËSIRË REKLAMUESE"
      />
    </section>
  );
}
