import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Registration } from "../../layout/registration/registration";
import { ContentService } from '../../services/content.service';


export interface SingelDoubleMeter {
  singleTariff:'',
  doubleTariff: '',
  singleImage: '',
  doubleImage: '',
  singleDescription: '',
  doubleDescription: ''
}

export interface InfoDialogData {
  title?: string;
  image?: string;
  description: string;
}

@Component({
  selector: 'app-heating-electricity',
  imports: [CommonModule, MatIconModule, MatDialogModule, RouterModule, Registration],
  templateUrl: './heating-electricity.html',
  styleUrl: './heating-electricity.css',
})


export class HeatingElectricity {
  selectedOption: 'ja' | 'nein' = 'ja';
  selectedTariff: 'single' | 'double' = 'single';
  showNoBanner = false;
  activeInfo: 'doubletariff' | null = null;

  currentDialogData: InfoDialogData[] = [];

  singleDoubleMeterHtml: string | null = null;

  constructor(public dialog: MatDialog, private contentService: ContentService) {}

  ngOnInit() {
    this.contentService.getSidebar().subscribe((sidebar: any[]) => {
      const item = sidebar.find(s => s.originalFileName === 'Warmepumpe.png');
      if (item) {
        if (item.savingPriceDetail) this.discountinfo = item.savingPriceDetail;
        
        // Connect Admin popupContent2 to the Single/Double Meter popup (Legacy)
        if (item.popupContent2) {
          this.singleDoubleMeter.singleDescription = item.popupContent2;
          this.singleDoubleMeter.doubleDescription = ''; // Hide default second paragraph
        }
        
        // If they provide a single HTML block via popupContent3, use it directly
        if (item.popupContent3) {
          this.singleDoubleMeterHtml = item.popupContent3;
        }
      }
    });
  }

  doubletariff = `Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
  Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).
  Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein
  Verbrauchswert zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung`;


  singleDoubleMeter = {
    singleTariff:'Eintarifzähler ermitteln den Verbrauch von Strom.',

    doubleTariff: `Eintarifzähler ermitteln den Verbrauch von Strom.`,

    singleImage: '/assets/images/single_meter.png',
    doubleImage: '/assets/images/double_meter.png',
    singleDescription:`Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
        Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).`,
    doubleDescription:
      `Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein Verbrauchswert
      zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung gestellt.`,
  };

  noticeParagraphs: string[] = [
    'Bitte beachten Sie, dass für den Abschluss eines Wärmepumpentarifs ein separater Zähler erforderlich ist.',
    'Falls Sie keinen separaten Zähler für Ihre Wärmepumpe haben, nutzen Sie bitte unseren Stromvergleich für den gesamten Haushalt.'
  ];

  discountinfo =  `<p> <strong>So haben wir gerechnet </strong> </p>
      <p> Wohnort: <i> Dortmund, 44141 </i>
       Jahresverbrauch: <i> 4.000 kWh </i> </p>
      <p> Günstigster Tarif: immergrün! Spar Smart FairMax, Kosten im ersten Jahr: 920,84 Euro </p>
      <p> Grundversorgungstarif: Dortmunder Energie- und Wasserversorgung GmbH Unser Strom.standard, Kosten: 1.828,72 Euro </p>
      <p><strong>Einsparung: 907,88 Euro</strong> <p>
      <p>(Stand: 16.02.2026) </p> `;


  select(option: 'ja' | 'nein') {
    this.selectedOption = option;

  if (option === 'nein') {
    this.selectedTariff = 'single';
    this.showNoBanner = true;
    } else {
      this.showNoBanner = false;
    }
  }

  closeNoBanner() {
    this.showNoBanner = false;
    this.selectedOption = 'ja'; // switches to JA view when X is clicked
  }

  tariff(type: 'single' | 'double') {
    this.selectedTariff = type;
  }

  isSingleDoubleMeterPopup = false;

  openSingleDoubleMeter(template: any) {
    this.isSingleDoubleMeterPopup = true;
    this.currentDialogData = [
      {
        title: this.singleDoubleMeter.singleTariff,
        image: this.singleDoubleMeter.singleImage,
        description: this.singleDoubleMeter.singleDescription,
      },
      {
        title: this.singleDoubleMeter.doubleTariff,
        image: this.singleDoubleMeter.doubleImage,
        description: this.singleDoubleMeter.doubleDescription,
      },
    ];
    this.dialog.open(template, { width: '470px', maxWidth: '80vw' });
  }


  currentDialogText = '';

openInfo(template: any, text: string) {
  this.isSingleDoubleMeterPopup = false;
  this.currentDialogText = text;
  this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
}


}
