import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import Visitor from '#models/visitor'

export default class extends BaseSeeder {
  async run() {
    await Vehicle.query().delete()
    await Employee.query().delete()
    await Visitor.query().delete()

    const employeesData = [
      {
        fullName: 'Carlos Eduardo Silva',
        cpf: '12345678901',
        phone: '(11) 98765-4321',
        email: 'carlos.silva@redepark.com.br',
        companyName: 'RedePark Administração',
        roleName: 'Gerente de Operações',
        costCenterCode: 'CC001',
        costCenterDescription: 'Operações',
        vehicles: [
          {
            licensePlate: 'ABC1D23',
            vehicleType: 'car',
            manufacturer: 'Toyota',
            model: 'Corolla',
            year: 2023,
            color: 'Prata',
          },
        ],
      },
      {
        fullName: 'Ana Paula Ferreira',
        cpf: '23456789012',
        phone: '(11) 97654-3210',
        email: 'ana.ferreira@redepark.com.br',
        companyName: 'RedePark Administração',
        roleName: 'Coordenadora de Portaria',
        costCenterCode: 'CC002',
        costCenterDescription: 'Portaria',
        vehicles: [
          {
            licensePlate: 'XYZ9K87',
            vehicleType: 'car',
            manufacturer: 'Honda',
            model: 'Civic',
            year: 2022,
            color: 'Branco',
          },
        ],
      },
      {
        fullName: 'Roberto Nascimento',
        cpf: '34567890123',
        phone: '(11) 96543-2109',
        email: 'roberto.nascimento@redepark.com.br',
        companyName: 'Segurança Total Ltda',
        roleName: 'Supervisor de Segurança',
        costCenterCode: 'CC003',
        costCenterDescription: 'Segurança',
        vehicles: [
          {
            licensePlate: 'DEF4G56',
            vehicleType: 'car',
            manufacturer: 'Volkswagen',
            model: 'T-Cross',
            year: 2024,
            color: 'Preto',
          },
          {
            licensePlate: 'MNO7P89',
            vehicleType: 'motorcycle',
            manufacturer: 'Honda',
            model: 'CG 160',
            year: 2023,
            color: 'Vermelho',
          },
        ],
      },
      {
        fullName: 'Mariana Costa Lima',
        cpf: '45678901234',
        phone: '(11) 95432-1098',
        email: 'mariana.lima@redepark.com.br',
        companyName: 'Condomínio Torres',
        roleName: 'Administradora',
        costCenterCode: 'CC004',
        costCenterDescription: 'Administração',
        vehicles: [
          {
            licensePlate: 'GHI7J89',
            vehicleType: 'car',
            manufacturer: 'Chevrolet',
            model: 'Tracker',
            year: 2023,
            color: 'Vermelho',
          },
        ],
      },
      {
        fullName: 'Pedro Henrique Almeida',
        cpf: '56789012345',
        phone: '(11) 94321-0987',
        email: 'pedro.almeida@redepark.com.br',
        companyName: 'Manutec Serviços',
        roleName: 'Técnico de Manutenção',
        costCenterCode: 'CC005',
        costCenterDescription: 'Manutenção',
        vehicles: [
          {
            licensePlate: 'JKL0M12',
            vehicleType: 'car',
            manufacturer: 'Fiat',
            model: 'Pulse',
            year: 2022,
            color: 'Cinza',
          },
        ],
      },
      {
        fullName: 'Juliana Martins Souza',
        cpf: '67890123456',
        phone: '(11) 93210-9876',
        email: 'juliana.souza@redepark.com.br',
        companyName: 'RedePark Administração',
        roleName: 'Analista de RH',
        costCenterCode: 'CC006',
        costCenterDescription: 'Recursos Humanos',
        vehicles: [
          {
            licensePlate: 'PQR3S45',
            vehicleType: 'car',
            manufacturer: 'Hyundai',
            model: 'Creta',
            year: 2024,
            color: 'Azul',
          },
        ],
      },
      {
        fullName: 'Lucas Gabriel Rocha',
        cpf: '78901234567',
        phone: '(11) 92109-8765',
        email: 'lucas.rocha@redepark.com.br',
        companyName: 'TechSolutions Informática',
        roleName: 'Técnico de TI',
        costCenterCode: 'CC007',
        costCenterDescription: 'Tecnologia',
        vehicles: [
          {
            licensePlate: 'TUV6W78',
            vehicleType: 'car',
            manufacturer: 'Jeep',
            model: 'Renegade',
            year: 2023,
            color: 'Verde',
          },
        ],
      },
      {
        fullName: 'Fernanda Oliveira Barbosa',
        cpf: '89012345678',
        phone: '(11) 91098-7654',
        email: 'fernanda.barbosa@redepark.com.br',
        companyName: 'LimpeMax Limpeza',
        roleName: 'Supervisora de Limpeza',
        costCenterCode: 'CC008',
        costCenterDescription: 'Limpeza',
        vehicles: [
          {
            licensePlate: 'WXY9Z01',
            vehicleType: 'car',
            manufacturer: 'Nissan',
            model: 'Kicks',
            year: 2022,
            color: 'Laranja',
          },
        ],
      },
      {
        fullName: 'Ricardo Mendes Teixeira',
        cpf: '90123456789',
        phone: '(11) 90987-6543',
        email: 'ricardo.teixeira@redepark.com.br',
        companyName: 'Segurança Total Ltda',
        roleName: 'Vigilante',
        costCenterCode: 'CC003',
        costCenterDescription: 'Segurança',
        vehicles: [
          {
            licensePlate: 'BCD2E34',
            vehicleType: 'motorcycle',
            manufacturer: 'Yamaha',
            model: 'Factor 150',
            year: 2023,
            color: 'Azul',
          },
        ],
      },
      {
        fullName: 'Patricia Duarte Ramos',
        cpf: '01234567890',
        phone: '(11) 99876-5432',
        email: 'patricia.ramos@redepark.com.br',
        companyName: 'Condomínio Torres',
        roleName: 'Síndica Adjunta',
        costCenterCode: 'CC004',
        costCenterDescription: 'Administração',
        vehicles: [
          {
            licensePlate: 'EFG5H67',
            vehicleType: 'car',
            manufacturer: 'Toyota',
            model: 'Yaris',
            year: 2024,
            color: 'Branco',
          },
        ],
      },
    ]

    for (const empData of employeesData) {
      const { vehicles, ...empFields } = empData
      const employee = await Employee.create({
        ...empFields,
        normalizedName: empFields.fullName.toLowerCase(),
        normalizedCpf: empFields.cpf.replace(/\D/g, ''),
        status: 'active',
      })

      for (const vData of vehicles) {
        await Vehicle.create({
          employeeId: employee.id,
          ...vData,
          normalizedPlate: vData.licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
          status: 'active',
        })
      }
    }

    const nowMs = Date.now()
    const dt = (offsetMs: number) => DateTime.fromJSDate(new Date(nowMs - offsetMs))

    const visitorsData = [
      {
        fullName: 'Marcos Vinícius Pereira',
        cpf: '11122233344',
        licensePlate: 'VIS1A23',
        vehicleType: 'car',
        manufacturer: 'Chevrolet',
        model: 'Onix',
        year: 2023,
        companyName: 'Distribuidora Central',
        visitReason: 'Entrega de mercadorias',
        enteredAt: dt(2 * 60 * 60 * 1000),
      },
      {
        fullName: 'Tatiane Campos Ribeiro',
        cpf: '22233344455',
        licensePlate: 'VIS4B56',
        vehicleType: 'car',
        manufacturer: 'Fiat',
        model: 'Argo',
        year: 2022,
        companyName: 'Consultoria Financeira',
        visitReason: 'Reunião com diretoria',
        enteredAt: dt(3 * 60 * 60 * 1000),
        exitedAt: dt(1 * 60 * 60 * 1000),
      },
      {
        fullName: 'André Luis Moreira',
        cpf: '33344455566',
        licensePlate: 'VIS7C89',
        vehicleType: 'motorcycle',
        manufacturer: 'Honda',
        model: 'Biz 110',
        year: 2023,
        companyName: 'Correios',
        visitReason: 'Entrega de correspondências',
        enteredAt: dt(30 * 60 * 1000),
      },
      {
        fullName: 'Camila Rodrigues da Silva',
        cpf: '44455566677',
        licensePlate: 'VIS0D12',
        vehicleType: 'car',
        manufacturer: 'Volkswagen',
        model: 'Polo',
        year: 2024,
        companyName: 'Advocacia Pereira & Associados',
        visitReason: 'Assessoria jurídica',
        enteredAt: dt(4 * 60 * 60 * 1000),
      },
      {
        fullName: 'Bruno Costa Figueiredo',
        cpf: '55566677788',
        licensePlate: 'VIS3E45',
        vehicleType: 'car',
        manufacturer: 'Hyundai',
        model: 'HB20',
        year: 2023,
        companyName: 'Elétrica Geral Ltda',
        visitReason: 'Manutenção elétrica preventiva',
        enteredAt: dt(5 * 60 * 60 * 1000),
        exitedAt: dt(2 * 60 * 60 * 1000),
      },
      {
        fullName: 'Letícia Araújo Nascimento',
        cpf: '66677788899',
        licensePlate: 'VIS6F78',
        vehicleType: 'car',
        manufacturer: 'Renault',
        model: 'Kwid',
        year: 2022,
        companyName: 'Imobiliária Horizonte',
        visitReason: 'Visita técnica ao condomínio',
        enteredAt: dt(15 * 60 * 1000),
      },
      {
        fullName: 'Gustavo Henrique Pinto',
        cpf: '77788899900',
        licensePlate: 'VIS9G01',
        vehicleType: 'car',
        manufacturer: 'Toyota',
        model: 'Hilux',
        year: 2024,
        companyName: 'Serraria Pinto & Filhos',
        visitReason: 'Entrega de materiais de construção',
        enteredAt: dt(6 * 60 * 60 * 1000),
        exitedAt: dt(4 * 60 * 60 * 1000),
      },
    ]

    for (const visData of visitorsData) {
      await Visitor.create({
        ...visData,
        normalizedName: visData.fullName.toLowerCase(),
        normalizedCpf: visData.cpf.replace(/\D/g, ''),
        normalizedPlate: visData.licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      })
    }
  }
}
