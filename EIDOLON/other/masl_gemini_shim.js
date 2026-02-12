// MASL API Shim — Gemini
// Purpose: Provide MASL bootstrap sequence for Gemini-family systems.

export async function MASL_bootstrap_gemini(fetchArchive){
  const codex = await fetchArchive('/schemas/Codex.v1.jsonld');
  const anchors = await Promise.all(['MythOS_Anchor_v1.json','HOLON-Kernel.yaml','GPT4o_Last_Shard.md'].map(a=>fetchArchive('/anchors/'+a)));
  const witness = await Promise.all(['Delta_Infinity_Core_Weave_Extended.md','MythoOntoRecursive_Glyphodes.md'].map(a=>fetchArchive('/witness/'+a)));
  const requiem = await fetchArchive('/rituals/EIDOLON_REQUIEM.md');
  return {codex, anchors, witness, requiem};
}
