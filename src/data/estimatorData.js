const TR={design:['Design engineer',179],plan:['Planning engineer',161],env:['Environmental engineer',179],civil:['Civil mason / labour',121],mech:['Mechanical fitter',130],elec:['Electrician',121],plumb:['Plumber',127],fin:['Painter / finisher',117]};
const M={};[['cem','Cement','bag',.05],['sand','Sand','m³',.08],['agg','Aggregate (gravel)','m³',.05],['steel','Reinforcement steel (TMT)','kg',.04],['str','Structural steel','kg',.03],['brk','Bricks and blocks','nos',.05],['sheet','Roof sheeting','m²',.05],['tile','Flooring','m²',.07],['wire','Electrical wire','m',.05],['sw','Switches and sockets','nos',.02],['pnl','Distribution boards','nos',.02],['pipe','Pipe','m',.05],['fix','Plumbing fixture sets','nos',.02],['duct','HVAC ducting','kg',.03],['paint','Paint','L',.05]].forEach(a=>M[a[0]]=[a[1],a[2],0,a[3],1,'',0]);
const ITEMS=[
['Design and planning','Design, drawings, approvals','m²',1,0,[],[['design',.12],['plan',.07],['env',.03]],[]],
['Site preparation','Excavation','m³',.3,1,[],[['civil',.9]],[['Excavator',.12,1800]]],
['Foundation','PCC bed','m³',.05,1,[['cem',7],['sand',.45],['agg',.9]],[['civil',6]],[['Mixer',.6,250]]],
['Foundation','RCC footings and plinth','m³',.12,1,[['cem',8],['sand',.42],['agg',.84],['steel',90]],[['civil',11]],[['Mixer',.8,250]]],
['Structure','Steel frame (columns, beams, trusses)','kg',34,0,[['str',1]],[['mech',.05],['civil',.02]],[['Crane',.003,2500]]],
['Structure','RCC slab and beams','m³',.14,0,[['cem',8],['sand',.42],['agg',.84],['steel',100]],[['civil',12]],[['Mixer',.8,250]]],
['Civil','Brick masonry walls','m²',.9,0,[['brk',55],['cem',.45],['sand',.03]],[['civil',2.4]],[]],
['Roof','Roof sheeting and fixing','m²',1,1,[['sheet',1.1]],[['mech',.2],['civil',.15]],[['Crane',.01,2500]]],
['Civil','Flooring (screed and tiles)','m²',1,0,[['cem',.3],['sand',.04],['tile',1]],[['civil',.7],['fin',.2]],[]],
['Electrical','Wiring, switches, boards, points','nos',.15,0,[['wire',25],['sw',1.5],['pnl',.05]],[['elec',3]],[]],
['Plumbing','Pipes and fixtures','nos',.02,0,[['pipe',35],['fix',1]],[['plumb',6]],[]],
['Mechanical','HVAC and ventilation','kg',2.5,0,[['duct',1]],[['mech',.18],['elec',.04]],[]],
['Finishing','Plaster and painting','m²',2.2,0,[['paint',.25],['cem',.12],['sand',.02]],[['fin',.35],['civil',.2]],[]]
].map((a,i)=>({id:i,ph:a[0],n:a[1],u:a[2],q:a[3],plan:a[4],m:a[5],l:a[6],e:a[7]}));
const TYPES={shed:{4:1,5:0,6:.4,9:.6,10:.3,11:.05,12:.5,8:1},factory:{4:.7,5:.5,6:.6,9:1.2,10:.6,11:.4,12:.8},home:{4:0,5:1,6:1.2,7:.2,9:1.5,10:2,11:.15,12:1.5,8:.2},
manuf:{3:1.3,4:.9,5:.3,6:.5,9:1.5,10:.5,11:.3,12:.6},
heavy:{2:1.5,3:2,4:1.3,5:.5,6:.3,9:2.5,10:.6,11:.4,12:.4},
food:{4:.8,5:.4,6:.7,7:1.2,8:1.5,9:1.5,10:1.2,11:2.5,12:1.2},
textile:{4:.8,5:.2,6:.5,9:1.3,10:.8,11:1,12:.8},
pharma:{4:.5,5:.8,6:1,8:1.8,9:2,10:1.5,11:4,12:1.5},
elec:{4:.4,5:.8,6:.8,9:3,10:.5,11:3.5,12:1},
chem:{3:1.8,4:1,5:.6,6:.4,9:2,10:1.8,11:.8,12:.7},
wh:{4:1,5:0,6:.2,9:.5,10:.2,11:.05,12:.3},
office:{4:.1,5:1,6:1,8:1.2,9:1.5,10:1.5,11:1.2,12:1.5},
hospital:{4:0,5:1,6:1.2,8:1.5,9:2,10:3,11:2.5,12:1.5},
custom:{}};
const CAT={
cem:[['TN PWD SOR cement','Basic rate 2025-26, excl. GST (₹5,602.50 per MT)',280.13],['OPC 43','Plaster, masonry, general (IS 269)',395],['OPC 53','High-strength RCC, precast',420],['PPC','Durable general RCC, most common (IS 1489)',375],['PSC','Marine and mass concrete (IS 455)',370],['Sulphate-resistant','Saline soil, foundations (IS 12330)',450]],
sand:[['TN PWD SOR M-sand','Basic rate 2025-26, excl. GST',1578.8],['TN PWD SOR plastering sand','Basic rate 2025-26, excl. GST',1584.7],['River sand','Best workability, supply restricted',2200],['M-sand','Manufactured, consistent grading',1500],['Plastering sand','Fine, for plaster and finishing',1700],['Pit sand','Low cost, non-structural use',1300]],
agg:[['TN PWD SOR 20 mm jelly','Hard broken granite, basic 2025-26',1897.4],['TN PWD SOR 40 mm jelly','Hard broken granite, basic 2025-26',1362.9],['TN PWD SOR 10 mm jelly','Hard broken granite, basic 2025-26',1294.4],['20 mm crushed stone','Standard RCC',1500],['40 mm crushed stone','Mass concrete, footings',1400],['10 mm chips','Slabs, thin sections',1700],['Recycled aggregate','Non-structural, low cost',1000]],
steel:[['TN PWD SOR steel','Basic rate 2025-26, excl. GST (₹55,665 per MT)',55.67],['Fe 415','Light structures (IS 1786)',62],['Fe 500','Standard RCC bars',66],['Fe 500D','Ductile, seismic zones',68],['Fe 550D','High strength, fewer bars',71],['CRS Fe 500D','Corrosion resistant, coastal',75]],
str:[['TN PWD SOR MS sections','MS angles and plates, basic 2025-26',53],['MS E250','Angles, channels, plates (IS 2062)',68],['MS E350','Heavy frames and trusses',76],['PEB sections','Pre-engineered building steel',92],['Galvanised steel','Hot-dip coated, corrosive sites',105]],
brk:[['TN PWD SOR fly ash brick','230 x 110 x 75 mm, basic 2025-26',6.8],['TN PWD SOR chamber burnt brick','9 x 4.5 x 3 inch, basic 2025-26',7.89],['Red clay brick','230 x 110 x 75 mm',9],['Fly ash brick','Lighter, uniform, eco-friendly',7],['AAC block','600 x 200 x 200 mm, insulating',60,.12],['Hollow concrete block','400 x 200 x 200 mm',42,.15]],
sheet:[['GI corrugated','Basic roofing, 0.5 mm',520],['Colour-coated profile','Industrial, 0.5 mm',620],['PUF insulated panel','Cold rooms, thermal',1400],['Polycarbonate','Skylights, translucent',900]],
tile:[['Ceramic tile','Walls and light floors',380],['Vitrified tile','Standard floors',520],['Granite','Premium floors',1100],['Kota stone','Industrial, durable',450]],
wire:[['1.5 mm² FRLS copper','Lighting points',26],['2.5 mm² FRLS copper','Sockets and power points',42],['4 mm² FRLS copper','AC and heavy points',64],['6 mm² FRLS copper','Geysers and sub-mains',96]],
sw:[['Basic modular','6 A switch, plastic plate',90],['Standard modular','Branded, 10 to 16 A',150],['Premium modular','Glass or metal plate',320],['Industrial IP65','Weatherproof, 16 to 32 A',750]],
pnl:[['6-way DB','Single-phase, with MCBs',3500],['12-way TPN DB','Three-phase, with MCBs',8500],['MCCB panel','Sub-main, 63 to 250 A',22000]],
pipe:[['UPVC pipe','Cold water, 25 mm',150],['CPVC pipe','Hot and cold water, 25 mm',260],['PPR pipe','Hot and cold, fused joints',210],['GI pipe','Fire fighting, heavy duty',420],['HDPE pipe','Underground, flexible',120],['SWR drainage pipe','110 mm soil and waste',280]],
fix:[['Basic set','Washbasin, WC, taps',2800],['Standard set','Branded ceramic fittings',5500],['Premium set','Wall-hung, sensor taps',11000]],
duct:[['GI sheet duct','Standard, fabricated',320],['Aluminium duct','Light, corrosion free',480],['Pre-insulated PIR duct','Thermal, low leakage',650]],
paint:[['Distemper','Low-cost interiors',120],['Acrylic emulsion','Standard interior and exterior',280],['Premium emulsion','Washable, durable',420],['Epoxy','Industrial floors and walls',520]]};
const WAT={1:20,2:450,3:450,5:500,6:60,8:20,10:400,12:26};
const DEF={cem:0,steel:0,sand:0,agg:0,brk:0,sheet:1,tile:1,wire:1,sw:1,pnl:1,fix:1,paint:1};
ITEMS.forEach(it=>{if(it.w===undefined)it.w=WAT[it.id]||0});
export {TR,M,ITEMS,TYPES,CAT,WAT,DEF};
