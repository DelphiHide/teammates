import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import SpyInstance = jest.SpyInstance;
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { CourseService } from '../services/course.service';
import { NavigationService } from '../services/navigation.service';
import { TimezoneService } from '../services/timezone.service';
import { LoadingSpinnerModule } from './components/loading-spinner/loading-spinner.module';
import { UserJoinPageComponent } from './user-join-page.component';

describe('UserJoinPageComponent', () => {
  let component: UserJoinPageComponent;
  let fixture: ComponentFixture<UserJoinPageComponent>;
  let navService: NavigationService;
  let courseService: CourseService;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserJoinPageComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoadingSpinnerModule,
      ],
      providers: [
        NavigationService,
        CourseService,
        AuthService,
        AccountService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              entitytype: 'student',
              key: 'key',
            }),
          },
        },
      ],
    })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserJoinPageComponent);
    component = fixture.componentInstance;
    navService = TestBed.inject(NavigationService);
    courseService = TestBed.inject(CourseService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should snap with default fields', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should snap if user is not logged in and has a valid url', () => {
    component.hasJoined = false;
    component.userId = '';
    component.validUrl = true;
    component.isLoading = false;

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should snap with invalid course join link', () => {
    component.userId = 'user';
    component.validUrl = false;
    component.isLoading = false;

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should snap with valid course join link that has been used', () => {
    component.userId = 'user';
    component.validUrl = true;
    component.hasJoined = true;
    component.isLoading = false;

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should snap with valid course join link that has not been used', () => {
    component.validUrl = true;
    component.userId = 'user';
    component.hasJoined = false;
    component.isLoading = false;

    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should join course when join course button is clicked on', () => {
    const params: string[] = ['key', 'student'];
    component.isLoading = false;
    component.hasJoined = false;
    component.userId = 'user';
    component.key = params[0];
    component.entityType = params[1];
    component.validUrl = true;

    const courseSpy: SpyInstance = jest.spyOn(courseService, 'joinCourse').mockReturnValue(of({}));
    const navSpy: SpyInstance = jest.spyOn(navService, 'navigateByURL').mockImplementation();

    fixture.detectChanges();

    const btn: any = fixture.debugElement.nativeElement.querySelector('#btn-confirm');
    btn.click();

    expect(courseSpy).toHaveBeenCalledTimes(1);
    expect(courseSpy).toHaveBeenLastCalledWith(...params);
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenLastCalledWith(expect.anything(), `/web/${params[1]}`);
  });

  it('should redirect user to home page if user is logged in and join URL has been used', () => {
    jest.spyOn(authService, 'getAuthUser').mockReturnValue(of({
      user: {
        id: 'user',
        isAdmin: false,
        isInstructor: false,
        isStudent: false,
        isMaintainer: false,
      },
      masquerade: false,
    }));
    jest.spyOn(courseService, 'getJoinCourseStatus').mockReturnValue(of({
      hasJoined: true,
    }));
    const navSpy: SpyInstance = jest.spyOn(navService, 'navigateByURL').mockImplementation();

    component.ngOnInit();

    expect(component.hasJoined).toBeTruthy();
    expect(component.userId).toEqual('user');
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenLastCalledWith(expect.anything(), '/web/student/home');
  });

  it('should stop loading and show error message if 404 is returned', () => {
    jest.spyOn(authService, 'getAuthUser').mockReturnValue(of({
      user: {
        id: 'user',
        isAdmin: false,
        isInstructor: false,
        isStudent: false,
        isMaintainer: false,
      },
      masquerade: false,
    }));
    jest.spyOn(courseService, 'getJoinCourseStatus').mockReturnValue(throwError({
      status: 404,
    }));

    component.ngOnInit();

    expect(component.isLoading).toBeFalsy();
    expect(component.validUrl).toBeFalsy();
  });

  it('should stop loading and redirect if user is not logged in', () => {
    jest.spyOn(authService, 'getAuthUser').mockReturnValue(of({
      masquerade: false,
    }));
    jest.spyOn(courseService, 'getJoinCourseStatus').mockReturnValue(of({
      hasJoined: true,
    }));

    component.ngOnInit();

    expect(component.isLoading).toBeFalsy();
  });
});

describe('UserJoinPageComponent creating account', () => {
  let component: UserJoinPageComponent;
  let fixture: ComponentFixture<UserJoinPageComponent>;
  let navService: NavigationService;
  let authService: AuthService;
  let accountService: AccountService;
  let courseService: CourseService;
  let timezoneService: TimezoneService;

  beforeEach((() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [UserJoinPageComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        LoadingSpinnerModule,
      ],
      providers: [
        NavigationService,
        CourseService,
        AuthService,
        AccountService,
        TimezoneService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              iscreatingaccount: 'true',
              key: 'key',
            }),
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserJoinPageComponent);
    component = fixture.componentInstance;
    navService = TestBed.inject(NavigationService);
    authService = TestBed.inject(AuthService);
    accountService = TestBed.inject(AccountService);
    courseService = TestBed.inject(CourseService);
    timezoneService = TestBed.inject(TimezoneService);
    fixture.detectChanges();
  });

  it('should create account and join course when join course button is clicked on', () => {
    component.isLoading = false;
    component.hasJoined = false;
    component.userId = 'user';
    component.isCreatingAccount = true;
    component.key = 'key';
    component.entityType = 'instructor';
    component.validUrl = true;

    const accountSpy: SpyInstance = jest.spyOn(accountService, 'createAccount').mockReturnValue(of({
      message: 'test message',
    }));
    const navSpy: SpyInstance = jest.spyOn(navService, 'navigateByURL').mockImplementation();
    jest.spyOn(timezoneService, 'guessTimezone').mockReturnValue('UTC');

    fixture.detectChanges();

    const btn: any = fixture.debugElement.nativeElement.querySelector('#btn-confirm');
    btn.click();

    expect(accountSpy).toHaveBeenCalledTimes(1);
    expect(accountSpy).toHaveBeenLastCalledWith('key', 'UTC');
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenLastCalledWith(expect.anything(), '/web/instructor');
  });

  it('should redirect user to home page if user is logged in and URL has been used', () => {
    jest.spyOn(authService, 'getAuthUser').mockReturnValue(of({
      user: {
        id: 'user',
        isAdmin: false,
        isInstructor: false,
        isStudent: false,
        isMaintainer: false,
      },
      masquerade: false,
    }));
    jest.spyOn(courseService, 'getJoinCourseStatus').mockReturnValue(of({
      hasJoined: true,
    }));
    const navSpy: SpyInstance = jest.spyOn(navService, 'navigateByURL').mockImplementation();

    component.ngOnInit();

    expect(component.hasJoined).toBeTruthy();
    expect(component.userId).toEqual('user');
    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenLastCalledWith(expect.anything(), '/web/instructor/home');
  });

  it('should stop loading and show error message if 404 is returned when creating new account', () => {
    jest.spyOn(authService, 'getAuthUser').mockReturnValue(of({
      user: {
        id: 'user',
        isAdmin: false,
        isInstructor: false,
        isStudent: false,
        isMaintainer: false,
      },
      masquerade: false,
    }));
    jest.spyOn(courseService, 'getJoinCourseStatus').mockReturnValue(throwError({
      status: 404,
    }));

    component.ngOnInit();

    expect(component.entityType).toBe('instructor');
    expect(component.isCreatingAccount).toBeTruthy();
    expect(component.isLoading).toBeFalsy();
    expect(component.validUrl).toBeFalsy();
  });
});
