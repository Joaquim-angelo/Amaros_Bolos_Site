const catalog = {
  redondo: [
    {name:"Mini", slices:18, price:100},
    {name:"PP", slices:22, price:120},
    {name:"PP2", slices:26, price:135},
    {name:"P", slices:40, price:150},
    {name:"MP", slices:47, price:180},
    {name:"M", slices:58, price:200},
    {name:"MG", slices:65, price:235},
    {name:"G", slices:85, price:280},
    {name:"XG", slices:100, price:350}
  ],
  quadrado: [
    {name:"P", slices:40, price:160},
    {name:"M", slices:58, price:220},
    {name:"G", slices:26, price:300}
  ],
  retangular: [
    {name:"P", slices:40, price:160},
    {name:"M", slices:58, price:220},
    {name:"G", slices:26, price:300}
  ]
};
const regular = ["Coco","Brigadeiro branco","Brigadeiro preto","Ninho","Três leites","Maracujá","Limão","Goiabada"];
const special = ["Ameixa","Castanha","Amendoim","Morangos","Kiwis"];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let selectedSize = 0;

function currentFormat(){return $('input[name="format"]:checked').value}
function renderSizes(){
  const format=currentFormat(), list=catalog[format];
  selectedSize=Math.min(selectedSize,list.length-1);
  $("#sizes").innerHTML=list.map((s,i)=>`
    <label class="size-option">
      <input type="radio" name="size" value="${i}" ${i===selectedSize?"checked":""}>
      <strong>${s.name}</strong><span>${s.slices} fatias</span><b>${money(s.price)}</b>
    </label>`).join("");
  $("#sizeHint").textContent = format==="redondo"
    ? "Preços para bolos redondos conforme o catálogo."
    : "Preços para bolos quadrados e retangulares conforme o catálogo.";
  $$('input[name="size"]').forEach(el=>el.addEventListener("change",()=>{selectedSize=Number(el.value);updateSummary()}));
  updateSummary();
}
function renderFillings(){
  $("#regularFillings").innerHTML=regular.map((name,i)=>`<label class="filling"><input type="checkbox" name="filling" value="${name}"><span>${name}</span></label>`).join("");
  $("#specialFillings").innerHTML=special.map(name=>`<label class="filling"><input type="checkbox" name="special" value="${name}"><span>${name}</span></label>`).join("");
  $$('input[name="filling"],input[name="special"]').forEach(el=>el.addEventListener("change",updateSummary));
}
function getSelections(){
  const format=currentFormat(), size=catalog[format][Number($('input[name="size"]:checked')?.value||0)];
  return {
    format:format==="redondo"?"Redondo":format==="quadrado"?"Quadrado":"Retangular",
    size, dough:$('input[name="dough"]:checked').value,
    fillings:$$('input[name="filling"]:checked').map(x=>x.value),
    specials:$$('input[name="special"]:checked').map(x=>x.value)
  };
}
function updateSummary(){
  const s=getSelections();
  const items=[
    ["Formato",s.format],["Tamanho",`${s.size.name} (${s.size.slices} fatias)`],
    ["Massa",s.dough],["Recheios",s.fillings.length?s.fillings.join(", "):"Não selecionado"]
  ];
  if(s.specials.length)items.push(["Recheios especiais",s.specials.join(", ")]);
  $("#summaryList").innerHTML=items.map(([k,v])=>`<li><span>${k}</span><span>${v}</span></li>`).join("");
  $("#total").textContent=money(s.size.price);
  $("#quoteNotice").hidden=!s.specials.length;
  $("#totalCaption").textContent=s.specials.length?"Preço base; adicionais a consultar":"Valor conforme catálogo";
}
function sendWhatsApp(){
  const s=getSelections(), name=$("#customerName").value.trim(), date=$("#orderDate").value, notes=$("#notes").value.trim();
  if(!s.fillings.length && !s.specials.length){alert("Selecione pelo menos um recheio para continuar.");$("#regularFillings").scrollIntoView({behavior:"smooth",block:"center"});return;}
  if(!name){alert("Informe seu nome para enviar o pedido.");$("#customerName").focus();return;}
  const dateText=date?new Date(date+"T12:00:00").toLocaleDateString("pt-BR"):"A combinar";
  const lines=[
    "🍰 *NOVO PEDIDO — AMARO'S BOLOS*","",
    `*Cliente:* ${name}`,`*Data desejada:* ${dateText}`,"",
    `*Formato:* ${s.format}`,`*Tamanho:* ${s.size.name} — ${s.size.slices} fatias`,
    `*Preço base:* ${money(s.size.price)}`,`*Massa:* ${s.dough}`,
    `*Recheio(s):* ${s.fillings.length?s.fillings.join(", "):"Não selecionado"}`
  ];
  if(s.specials.length)lines.push(`*Recheios especiais:* ${s.specials.join(", ")} (adicional a consultar)`);
  lines.push("",`*Total estimado:* ${money(s.size.price)}${s.specials.length?" + adicionais a consultar":""}`);
  if(notes)lines.push("",`*Observações:* ${notes}`);
  lines.push("","Aguardo confirmação de disponibilidade e valor final. 💗");
  const phone="558699253561";
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`,"_blank","noopener");
}
$$('input[name="format"]').forEach(el=>el.addEventListener("change",()=>{selectedSize=0;renderSizes()}));
$$('input[name="dough"]').forEach(el=>el.addEventListener("change",updateSummary));
renderFillings();
renderSizes();
$("#sendOrder").addEventListener("click",sendWhatsApp);
const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());$("#orderDate").min=today.toISOString().slice(0,10);
