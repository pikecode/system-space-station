export interface Region {
  value: string;
  label: string;
  children?: Region[];
}

const regions: Region[] = [
  {
    value: '北京市', label: '北京市',
    children: [{ value: '北京市', label: '北京市', children: [
      { value: '东城区', label: '东城区' }, { value: '西城区', label: '西城区' },
      { value: '朝阳区', label: '朝阳区' }, { value: '丰台区', label: '丰台区' },
      { value: '海淀区', label: '海淀区' }, { value: '石景山区', label: '石景山区' },
      { value: '通州区', label: '通州区' }, { value: '顺义区', label: '顺义区' },
      { value: '大兴区', label: '大兴区' }, { value: '昌平区', label: '昌平区' },
    ]}],
  },
  {
    value: '上海市', label: '上海市',
    children: [{ value: '上海市', label: '上海市', children: [
      { value: '黄浦区', label: '黄浦区' }, { value: '徐汇区', label: '徐汇区' },
      { value: '长宁区', label: '长宁区' }, { value: '静安区', label: '静安区' },
      { value: '普陀区', label: '普陀区' }, { value: '虹口区', label: '虹口区' },
      { value: '浦东新区', label: '浦东新区' }, { value: '闵行区', label: '闵行区' },
      { value: '宝山区', label: '宝山区' }, { value: '嘉定区', label: '嘉定区' },
    ]}],
  },
  {
    value: '天津市', label: '天津市',
    children: [{ value: '天津市', label: '天津市', children: [
      { value: '和平区', label: '和平区' }, { value: '河东区', label: '河东区' },
      { value: '河西区', label: '河西区' }, { value: '南开区', label: '南开区' },
      { value: '河北区', label: '河北区' }, { value: '红桥区', label: '红桥区' },
      { value: '滨海新区', label: '滨海新区' }, { value: '武清区', label: '武清区' },
    ]}],
  },
  {
    value: '重庆市', label: '重庆市',
    children: [{ value: '重庆市', label: '重庆市', children: [
      { value: '渝中区', label: '渝中区' }, { value: '大渡口区', label: '大渡口区' },
      { value: '江北区', label: '江北区' }, { value: '沙坪坝区', label: '沙坪坝区' },
      { value: '九龙坡区', label: '九龙坡区' }, { value: '南岸区', label: '南岸区' },
      { value: '北碚区', label: '北碚区' }, { value: '渝北区', label: '渝北区' },
    ]}],
  },
  {
    value: '广东省', label: '广东省',
    children: [
      { value: '广州市', label: '广州市', children: [
        { value: '天河区', label: '天河区' }, { value: '越秀区', label: '越秀区' },
        { value: '海珠区', label: '海珠区' }, { value: '荔湾区', label: '荔湾区' },
        { value: '白云区', label: '白云区' }, { value: '黄埔区', label: '黄埔区' },
        { value: '番禺区', label: '番禺区' }, { value: '南沙区', label: '南沙区' },
      ]},
      { value: '深圳市', label: '深圳市', children: [
        { value: '福田区', label: '福田区' }, { value: '罗湖区', label: '罗湖区' },
        { value: '南山区', label: '南山区' }, { value: '宝安区', label: '宝安区' },
        { value: '龙岗区', label: '龙岗区' }, { value: '龙华区', label: '龙华区' },
        { value: '坪山区', label: '坪山区' }, { value: '光明区', label: '光明区' },
      ]},
      { value: '东莞市', label: '东莞市', children: [
        { value: '莞城区', label: '莞城区' }, { value: '南城区', label: '南城区' },
        { value: '万江区', label: '万江区' }, { value: '石碣镇', label: '石碣镇' },
      ]},
      { value: '佛山市', label: '佛山市', children: [
        { value: '禅城区', label: '禅城区' }, { value: '南海区', label: '南海区' },
        { value: '顺德区', label: '顺德区' }, { value: '三水区', label: '三水区' },
      ]},
      { value: '珠海市', label: '珠海市', children: [
        { value: '香洲区', label: '香洲区' }, { value: '斗门区', label: '斗门区' }, { value: '金湾区', label: '金湾区' },
      ]},
    ],
  },
  {
    value: '浙江省', label: '浙江省',
    children: [
      { value: '杭州市', label: '杭州市', children: [
        { value: '西湖区', label: '西湖区' }, { value: '上城区', label: '上城区' },
        { value: '拱墅区', label: '拱墅区' }, { value: '余杭区', label: '余杭区' },
        { value: '滨江区', label: '滨江区' }, { value: '萧山区', label: '萧山区' },
      ]},
      { value: '宁波市', label: '宁波市', children: [
        { value: '海曙区', label: '海曙区' }, { value: '江北区', label: '江北区' },
        { value: '北仑区', label: '北仑区' }, { value: '镇海区', label: '镇海区' },
        { value: '鄞州区', label: '鄞州区' }, { value: '奉化区', label: '奉化区' },
      ]},
      { value: '温州市', label: '温州市', children: [
        { value: '鹿城区', label: '鹿城区' }, { value: '龙湾区', label: '龙湾区' }, { value: '瓯海区', label: '瓯海区' },
      ]},
      { value: '嘉兴市', label: '嘉兴市', children: [
        { value: '南湖区', label: '南湖区' }, { value: '秀洲区', label: '秀洲区' },
      ]},
    ],
  },
  {
    value: '江苏省', label: '江苏省',
    children: [
      { value: '南京市', label: '南京市', children: [
        { value: '玄武区', label: '玄武区' }, { value: '秦淮区', label: '秦淮区' },
        { value: '建邺区', label: '建邺区' }, { value: '鼓楼区', label: '鼓楼区' },
        { value: '浦口区', label: '浦口区' }, { value: '栖霞区', label: '栖霞区' },
        { value: '雨花台区', label: '雨花台区' }, { value: '江宁区', label: '江宁区' },
      ]},
      { value: '苏州市', label: '苏州市', children: [
        { value: '姑苏区', label: '姑苏区' }, { value: '吴中区', label: '吴中区' },
        { value: '相城区', label: '相城区' }, { value: '吴江区', label: '吴江区' },
        { value: '工业园区', label: '工业园区' }, { value: '高新区', label: '高新区' },
      ]},
      { value: '无锡市', label: '无锡市', children: [
        { value: '梁溪区', label: '梁溪区' }, { value: '锡山区', label: '锡山区' },
        { value: '惠山区', label: '惠山区' }, { value: '滨湖区', label: '滨湖区' },
        { value: '新吴区', label: '新吴区' },
      ]},
      { value: '南通市', label: '南通市', children: [
        { value: '崇川区', label: '崇川区' }, { value: '通州区', label: '通州区' }, { value: '海门区', label: '海门区' },
      ]},
    ],
  },
  {
    value: '四川省', label: '四川省',
    children: [
      { value: '成都市', label: '成都市', children: [
        { value: '锦江区', label: '锦江区' }, { value: '青羊区', label: '青羊区' },
        { value: '金牛区', label: '金牛区' }, { value: '武侯区', label: '武侯区' },
        { value: '成华区', label: '成华区' }, { value: '高新区', label: '高新区' },
        { value: '双流区', label: '双流区' }, { value: '郫都区', label: '郫都区' },
      ]},
      { value: '绵阳市', label: '绵阳市', children: [
        { value: '涪城区', label: '涪城区' }, { value: '游仙区', label: '游仙区' },
      ]},
      { value: '德阳市', label: '德阳市', children: [
        { value: '旌阳区', label: '旌阳区' }, { value: '广汉市', label: '广汉市' },
      ]},
    ],
  },
  {
    value: '湖北省', label: '湖北省',
    children: [
      { value: '武汉市', label: '武汉市', children: [
        { value: '江岸区', label: '江岸区' }, { value: '江汉区', label: '江汉区' },
        { value: '硚口区', label: '硚口区' }, { value: '汉阳区', label: '汉阳区' },
        { value: '武昌区', label: '武昌区' }, { value: '青山区', label: '青山区' },
        { value: '洪山区', label: '洪山区' }, { value: '东湖新技术开发区', label: '东湖新技术开发区' },
      ]},
      { value: '宜昌市', label: '宜昌市', children: [
        { value: '西陵区', label: '西陵区' }, { value: '伍家岗区', label: '伍家岗区' },
      ]},
    ],
  },
  {
    value: '湖南省', label: '湖南省',
    children: [
      { value: '长沙市', label: '长沙市', children: [
        { value: '芙蓉区', label: '芙蓉区' }, { value: '天心区', label: '天心区' },
        { value: '岳麓区', label: '岳麓区' }, { value: '开福区', label: '开福区' },
        { value: '雨花区', label: '雨花区' }, { value: '望城区', label: '望城区' },
      ]},
      { value: '株洲市', label: '株洲市', children: [
        { value: '荷塘区', label: '荷塘区' }, { value: '芦淞区', label: '芦淞区' },
      ]},
    ],
  },
  {
    value: '河南省', label: '河南省',
    children: [
      { value: '郑州市', label: '郑州市', children: [
        { value: '中原区', label: '中原区' }, { value: '二七区', label: '二七区' },
        { value: '管城回族区', label: '管城回族区' }, { value: '金水区', label: '金水区' },
        { value: '上街区', label: '上街区' }, { value: '惠济区', label: '惠济区' },
        { value: '郑东新区', label: '郑东新区' },
      ]},
      { value: '洛阳市', label: '洛阳市', children: [
        { value: '老城区', label: '老城区' }, { value: '西工区', label: '西工区' },
        { value: '涧西区', label: '涧西区' }, { value: '洛龙区', label: '洛龙区' },
      ]},
    ],
  },
  {
    value: '山东省', label: '山东省',
    children: [
      { value: '济南市', label: '济南市', children: [
        { value: '历下区', label: '历下区' }, { value: '市中区', label: '市中区' },
        { value: '槐荫区', label: '槐荫区' }, { value: '天桥区', label: '天桥区' },
        { value: '历城区', label: '历城区' }, { value: '长清区', label: '长清区' },
      ]},
      { value: '青岛市', label: '青岛市', children: [
        { value: '市南区', label: '市南区' }, { value: '市北区', label: '市北区' },
        { value: '黄岛区', label: '黄岛区' }, { value: '崂山区', label: '崂山区' },
        { value: '李沧区', label: '李沧区' }, { value: '城阳区', label: '城阳区' },
      ]},
    ],
  },
  {
    value: '陕西省', label: '陕西省',
    children: [
      { value: '西安市', label: '西安市', children: [
        { value: '新城区', label: '新城区' }, { value: '碑林区', label: '碑林区' },
        { value: '莲湖区', label: '莲湖区' }, { value: '灞桥区', label: '灞桥区' },
        { value: '未央区', label: '未央区' }, { value: '雁塔区', label: '雁塔区' },
        { value: '阎良区', label: '阎良区' }, { value: '临潼区', label: '临潼区' },
        { value: '长安区', label: '长安区' }, { value: '高新区', label: '高新区' },
      ]},
    ],
  },
  {
    value: '福建省', label: '福建省',
    children: [
      { value: '福州市', label: '福州市', children: [
        { value: '鼓楼区', label: '鼓楼区' }, { value: '台江区', label: '台江区' },
        { value: '仓山区', label: '仓山区' }, { value: '马尾区', label: '马尾区' },
        { value: '晋安区', label: '晋安区' }, { value: '长乐区', label: '长乐区' },
      ]},
      { value: '厦门市', label: '厦门市', children: [
        { value: '思明区', label: '思明区' }, { value: '海沧区', label: '海沧区' },
        { value: '湖里区', label: '湖里区' }, { value: '集美区', label: '集美区' },
        { value: '同安区', label: '同安区' }, { value: '翔安区', label: '翔安区' },
      ]},
    ],
  },
  {
    value: '安徽省', label: '安徽省',
    children: [
      { value: '合肥市', label: '合肥市', children: [
        { value: '庐阳区', label: '庐阳区' }, { value: '瑶海区', label: '瑶海区' },
        { value: '蜀山区', label: '蜀山区' }, { value: '包河区', label: '包河区' },
        { value: '长丰县', label: '长丰县' }, { value: '肥东县', label: '肥东县' },
      ]},
    ],
  },
  {
    value: '河北省', label: '河北省',
    children: [
      { value: '石家庄市', label: '石家庄市', children: [
        { value: '长安区', label: '长安区' }, { value: '桥西区', label: '桥西区' },
        { value: '新华区', label: '新华区' }, { value: '井陉矿区', label: '井陉矿区' },
        { value: '裕华区', label: '裕华区' }, { value: '藁城区', label: '藁城区' },
      ]},
    ],
  },
  {
    value: '辽宁省', label: '辽宁省',
    children: [
      { value: '沈阳市', label: '沈阳市', children: [
        { value: '沈河区', label: '沈河区' }, { value: '和平区', label: '和平区' },
        { value: '大东区', label: '大东区' }, { value: '皇姑区', label: '皇姑区' },
        { value: '铁西区', label: '铁西区' }, { value: '苏家屯区', label: '苏家屯区' },
      ]},
      { value: '大连市', label: '大连市', children: [
        { value: '中山区', label: '中山区' }, { value: '西岗区', label: '西岗区' },
        { value: '沙河口区', label: '沙河口区' }, { value: '甘井子区', label: '甘井子区' },
        { value: '旅顺口区', label: '旅顺口区' }, { value: '金州区', label: '金州区' },
      ]},
    ],
  },
  {
    value: '黑龙江省', label: '黑龙江省',
    children: [
      { value: '哈尔滨市', label: '哈尔滨市', children: [
        { value: '道里区', label: '道里区' }, { value: '道外区', label: '道外区' },
        { value: '南岗区', label: '南岗区' }, { value: '松北区', label: '松北区' },
        { value: '香坊区', label: '香坊区' }, { value: '呼兰区', label: '呼兰区' },
      ]},
    ],
  },
  {
    value: '吉林省', label: '吉林省',
    children: [
      { value: '长春市', label: '长春市', children: [
        { value: '朝阳区', label: '朝阳区' }, { value: '南关区', label: '南关区' },
        { value: '宽城区', label: '宽城区' }, { value: '二道区', label: '二道区' },
        { value: '绿园区', label: '绿园区' }, { value: '双阳区', label: '双阳区' },
      ]},
    ],
  },
  {
    value: '云南省', label: '云南省',
    children: [
      { value: '昆明市', label: '昆明市', children: [
        { value: '盘龙区', label: '盘龙区' }, { value: '五华区', label: '五华区' },
        { value: '官渡区', label: '官渡区' }, { value: '西山区', label: '西山区' },
        { value: '东川区', label: '东川区' }, { value: '呈贡区', label: '呈贡区' },
      ]},
    ],
  },
  {
    value: '贵州省', label: '贵州省',
    children: [
      { value: '贵阳市', label: '贵阳市', children: [
        { value: '南明区', label: '南明区' }, { value: '云岩区', label: '云岩区' },
        { value: '花溪区', label: '花溪区' }, { value: '乌当区', label: '乌当区' },
        { value: '白云区', label: '白云区' }, { value: '观山湖区', label: '观山湖区' },
      ]},
    ],
  },
  {
    value: '江西省', label: '江西省',
    children: [
      { value: '南昌市', label: '南昌市', children: [
        { value: '东湖区', label: '东湖区' }, { value: '西湖区', label: '西湖区' },
        { value: '青云谱区', label: '青云谱区' }, { value: '湾里区', label: '湾里区' },
        { value: '青山湖区', label: '青山湖区' }, { value: '新建区', label: '新建区' },
      ]},
    ],
  },
  {
    value: '广西壮族自治区', label: '广西壮族自治区',
    children: [
      { value: '南宁市', label: '南宁市', children: [
        { value: '兴宁区', label: '兴宁区' }, { value: '青秀区', label: '青秀区' },
        { value: '江南区', label: '江南区' }, { value: '西乡塘区', label: '西乡塘区' },
        { value: '良庆区', label: '良庆区' }, { value: '邕宁区', label: '邕宁区' },
      ]},
    ],
  },
  {
    value: '内蒙古自治区', label: '内蒙古自治区',
    children: [
      { value: '呼和浩特市', label: '呼和浩特市', children: [
        { value: '回民区', label: '回民区' }, { value: '玉泉区', label: '玉泉区' },
        { value: '赛罕区', label: '赛罕区' }, { value: '新城区', label: '新城区' },
      ]},
    ],
  },
  {
    value: '新疆维吾尔自治区', label: '新疆维吾尔自治区',
    children: [
      { value: '乌鲁木齐市', label: '乌鲁木齐市', children: [
        { value: '天山区', label: '天山区' }, { value: '沙依巴克区', label: '沙依巴克区' },
        { value: '新市区', label: '新市区' }, { value: '水磨沟区', label: '水磨沟区' },
        { value: '米东区', label: '米东区' },
      ]},
    ],
  },
];

export default regions;
